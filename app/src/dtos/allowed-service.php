<?php
namespace Full;

use Api\HttpError;

require_once "dtos/dto.php";

class AllowedService extends \Dto {
    static function getTableName() {
        return "allowed_services";
    }

    public $id;
    public $name;
    public $domain;

    public function validate(): bool {
        if (empty($this->name)) {
            throw new HttpError("Name required.", 400);
        }

        if (empty($this->domain)) {
            throw new HttpError("Domain required.", 400);
        }

        return true;
    }
}
?>
