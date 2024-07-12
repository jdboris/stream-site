import { useState, useRef, useEffect } from "react";
import css from "./suggestion-box.module.scss";
import theme from "../../css/theme.module.scss";
import { MdDelete as Delete } from "react-icons/md";
import { tryOperation, resetAnimations } from "../../utils/utils";
import ReactPaginate from "react-paginate";

export function SuggestionBox({ useSuggestions, useAuth }) {
  const {
    page,
    pageCount,
    readPage,
    suggestions,
    validate,
    saveSuggestion,
    deleteSuggestion,
    loading,
  } = useSuggestions();
  const { user } = useAuth();
  const [errors, setErrors] = useState([]);
  const [newSuggestion, setNewSuggestion] = useState("");
  const textbox = useRef();

  const itemsPerPage = 9;

  useEffect(() => {
    readPage(page, itemsPerPage);
  }, [readPage, itemsPerPage, page]);

  return (
    <form
      className={theme.card + " " + css.suggestionBox}
      onSubmit={(e) => {
        e.preventDefault();
        if (loading) return;
        tryOperation(
          async () => {
            if (!user) {
              throw new Error("Login to do that.");
            }
            if (!user.emailVerified) {
              throw new Error("Verify your email to do that.");
            }

            const suggestion = { text: newSuggestion, userId: user.id };
            validate(suggestion);
            await saveSuggestion(suggestion);
            await readPage(page, itemsPerPage);
            setNewSuggestion("");
          },
          (errors) => {
            setErrors(errors);
            resetAnimations(textbox);
          }
        );
      }}
    >
      <header>
        <span className={theme.title + " " + css.title}>Suggestion Box</span>
        <fieldset disabled={loading}>
          {errors.length > 0 && (
            <span className={theme.errorCaption}>{errors[0]}</span>
          )}
          <input
            ref={textbox}
            className={`${theme.inputChain} ${
              errors && errors.length ? theme.errorFlash : ""
            }`}
            type="text"
            value={newSuggestion}
            onInput={(e) => {
              setNewSuggestion(e.target.value);
            }}
          />{" "}
          <button
            className={`${theme.inputChain} ${loading ? theme.loading : ""}`}
          >
            Submit
          </button>
        </fieldset>
      </header>
      <main className={loading ? theme.loading : ""}>
        <ul>
          {suggestions.map((suggestion, i) => (
            <li key={`suggestion-box-suggestion-${i}`}>
              <span>{suggestion.text}</span>

              {user && user.isAdmin && (
                <Delete
                  className={theme.button}
                  onClick={async () => {
                    if (loading) return;
                    tryOperation(async () => {
                      await deleteSuggestion(suggestion);
                      await readPage(page, itemsPerPage);
                    }, setErrors);
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      </main>
      <footer>
        {suggestions && (
          <ReactPaginate
            className={theme.pagination}
            pageCount={pageCount}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            onPageChange={(item) => {
              readPage(item.selected + 1, itemsPerPage);
            }}
            nextLabel={">"}
            previousLabel={"<"}
            disabledClassName={theme.disabled}
            activeClassName={theme.disabled}
          />
        )}
      </footer>
    </form>
  );
}
