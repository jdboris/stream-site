<?php
require_once "utils/sql.php";
require_once "dtos/full/user.php";

use Api\HttpError;

function getPublicVars($dto)
{
    return get_object_vars($dto);
}

function getPublicClassVars($class)
{
    return get_class_vars($class);
}

function addTableNames($array, $table)
{
    $keys = array_map(function ($key) use ($table) {
        return "`$table`.`$key`";
    }, array_keys($array));

    return array_combine($keys, $array);
}

abstract class Dto
{
    abstract public static function getTableName();
    /**
     * Checks validity of properties and throws a ValidationError if any are invalid.
     * @throws ValidationError
     */
    abstract public function validate(): bool;
    public static function canUserCreate(?Full\User $user): bool
    {
        return false;
    }
    public static function canUserRead(?Full\User $user): bool
    {
        return false;
    }
    public static function canUserUpdate(?Full\User $user): bool
    {
        return false;
    }
    public static function canUserDelete(?Full\User $user, $dto): bool
    {
        return false;
    }

    private static $annotationsCache = [];

    private static function getOwnFields($dto = null)
    {
        $annotations = static::getAnnotations();
        $props = $dto ? getPublicVars($dto) : getPublicClassVars(static::class);

        $dtoProps = array_filter($annotations, function ($value) {
            return isset($value["fk"]);
        });

        return array_diff_key($props, $dtoProps);
    }

    private static function getAllFields($prefix = "")
    {
        $reflect = new ReflectionClass(static::class);
        $annotations = static::getAnnotations($reflect);

        $props = getPublicClassVars(static::class);
        $fields = [];
        foreach (array_keys($props) as $prop) {
            if ($fk = $annotations[$prop]["fk"] ?? null) {
                $reflect = new ReflectionClass(
                    $reflect
                        ->getProperty($prop)
                        ->getType()
                        ->getName()
                );

                $fields = array_merge(
                    $fields,
                    $reflect->getName()::getAllFields("$prop.")
                );
            } else {
                $table = static::getTableName();
                $fields[] = "`$table`.`$prop` AS `$prefix$prop`";
            }
        }

        return $fields;
    }

    private static function joinClause($reflect = null)
    {
        $reflect = $reflect ?? new ReflectionClass(static::class);
        $annotations = static::getAnnotations($reflect);

        // ["banner" => ["fk" => "bannerId"]]
        $dtoProps = array_filter($annotations, function ($value) {
            return isset($value["fk"]);
        });

        $joinClause = "";

        foreach ($dtoProps as $key => $value) {
            $otherTable = $reflect
                ->getProperty($key)
                ->getType()
                ->getName()
                ::getTableName();
            // ["settings", "bannerId", "banners"]
            $chain = [static::getTableName(), $value["fk"], $otherTable];

            $left = $chain[0];

            // ["settings", "bannerId", "banners"]
            // ["users", "userId", "user_conversations", "conversationId", "conversations"]
            for ($i = 0; $i < count($chain); $i += 4) {
                $left = $chain[$i];
                $fk = $chain[$i + 1];
                $right = $chain[$i + 2];

                $joinClause .= " INNER JOIN `$right` ON `$left`.`$fk` = `$right`.`id` ";

                if (isset($chain[$i + 3])) {
                    $left = $chain[$i];
                    $fk = $chain[$i + 1];
                    $right = $chain[$i + 2];

                    $joinClause .= " INNER JOIN `$right` ON `$left`.`$fk` = `$right`.`id` ";
                }
            }
        }

        return $joinClause;
    }

    // ["banner" => ["fk" => "bannerId"]]
    private static function getAnnotations($reflect = null)
    {
        if ($annotations = static::$annotationsCache[static::class] ?? null) {
            return $annotations;
        }

        $reflect = $reflect ?? new ReflectionClass(static::class);
        $props = $reflect->getProperties(ReflectionProperty::IS_PUBLIC);
        $annotations = [];
        foreach ($props as $prop) {
            preg_match_all(
                "/(?:@)(\S+)(?:\s+)(\S+)/",
                $prop->getDocComment(),
                $temp
            );
            if (count($temp[1])) {
                $annotations[$prop->getName()] = array_combine(
                    $temp[1],
                    $temp[2]
                );
            }
        }

        static::$annotationsCache[static::class] = $annotations;
        // ["banner" => ["fk" => "bannerId"]]
        return $annotations;
    }

    static function get(
        $filters = [],
        $limit = 1,
        $offset = 0,
        // ["WHERE start > ? AND end < ?", $start, $end]
        $customClause = [],
        $orderBy = "",
        $bypassAuth = false
    ) {
        if (!$bypassAuth && !static::canUserRead(Full\User::current())) {
            throw new HttpError("Insufficient permissions.", 403);
        }

        $filters = $filters ?? [];
        static::getAnnotations();
        $properties = static::getOwnFields();

        // Ensure the given filters are actually exposed by this class
        foreach ($filters as $key => $value) {
            if (!array_key_exists($key, $properties)) {
                error_log(
                    "Error: Attempting to filter by property '$key' not exposed by this class."
                );
                throw new InvalidArgumentException("Invlaid arguments.", 400);
            }
        }

        $table = static::getTableName();
        $filters = addTableNames($filters, $table);
        $fields = static::getAllFields();

        $joinClause = static::joinClause();
        $query =
            "SELECT " .
            implode(", ", $fields) .
            " FROM `$table` $joinClause " .
            // Prioritize the custom clause over filters
            (count($customClause)
                ? $customClause[0]
                : (count($filters)
                    ? " WHERE " .
                    implode(" = ? AND ", array_keys($filters)) .
                    " = ? "
                    : "")) .
            ($orderBy ? " ORDER BY $orderBy " : "") .
            " LIMIT ? OFFSET ? ";

        $rows = Sql\query(
            $query,
            ...[
                ...array_values(
                    count($customClause)
                        ? array_slice($customClause, 1)
                        : $filters
                ),
                $limit,
                $offset,
            ]
        );

        $class = static::class;
        $dtos = array_map(function ($row) use ($class) {
            $dto = new $class();
            $dto->copyFrom((object) $row);
            return $dto;
        }, $rows);

        if ($limit == 1) {
            if (!Sql\mysqli()->affected_rows) {
                return null;
            }

            return $dtos[0];
        }

        return $dtos;
    }

    function copyFrom($data, $onlyExisting = false, $skipDependants = false)
    {
        $reflect = new ReflectionClass(static::class);
        $annotations = static::getAnnotations($reflect);

        if ($onlyExisting) {
            $props = get_object_vars($this);
        } else {
            $props = get_object_vars($data);
        }

        // NOTE: Must ignore $value. Can't be sure it's the value of the data (source) prop
        foreach ($props as $key => $value) {
            if (property_exists($data, $key)) {
                if ($skipDependants && ($annotations[$key]["fk"] ?? null)) {
                    continue;
                }
                if (is_array($data->$key)) {
                    $class = $reflect
                        ->getProperty($key)
                        ->getType()
                        ->getName();

                    $this->$key = $this->$key ?? new $class();
                    $this->$key->copyFrom((object) $data->$key);
                } else {
                    $this->$key = $data->$key;
                }
            }
        }
    }

    /**
     * @param array properties An associative array of properties to update.
     * @return array
     */
    function save($properties = null, $bypassAuth = false)
    {
        if ($this->id) {
            if (!$bypassAuth && !static::canUserUpdate(Full\User::current())) {
                throw new HttpError("Insufficient permissions.", 403);
            }
        } else {
            if (!$bypassAuth && !static::canUserCreate(Full\User::current())) {
                throw new HttpError("Insufficient permissions.", 403);
            }
        }

        $this->validate();

        $table = static::getTableName();
        $fields = $properties ?? static::getOwnFields($this);

        // Filter out the fields with an empty value and the @use_default annotation
        $fields = array_filter(
            $fields,
            function ($value, $key) {
                $annotations = static::getAnnotations();
                return !(empty($value) && isset($annotations[$key]["use_default"])
                );
            },
            ARRAY_FILTER_USE_BOTH
        );

        if ($this->id) {
            $query =
                "UPDATE `$table` SET `" .
                implode("` = ?, `", array_keys($fields)) .
                "` = ? " .
                " WHERE `id` = ?";

            return Sql\query($query, ...[...array_values($fields), $this->id]);
        } else {
            $query =
                "INSERT INTO `$table`(`" .
                implode("`, `", array_keys($fields)) .
                "`) " .
                " VALUES( " .
                implode(", ", array_fill(0, count($fields), "?")) .
                " ) ";

            $this->id = Sql\mysqli()->insert_id;

            return Sql\query($query, ...[...array_values($fields)]);
        }
    }

    function delete($bypassAuth = false)
    {
        if (!$bypassAuth && !static::canUserDelete(Full\User::current(), $this)) {
            throw new HttpError("Insufficient permissions.", 403);
        }

        $table = static::getTableName();

        $query = "DELETE FROM `$table` WHERE `id` = ?";

        return Sql\query($query, $this->id);
    }

    public function __set($name, $value)
    {
        error_log(
            "Error: Attempting to set property '$name' not exposed by this class, to value: $value"
        );
        throw new InvalidArgumentException("Invlaid arguments.", 400);
    }
}
