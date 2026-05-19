import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./ThemedSelect.css";

function normalizeValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function normalizeOption(option) {
  if (typeof option === "string" || typeof option === "number") {
    const value = normalizeValue(option);

    return {
      value,
      label: value,
      description: "",
      disabled: false,
    };
  }

  return {
    value: normalizeValue(option?.value),
    label: option?.label || normalizeValue(option?.value),
    description: option?.description || "",
    disabled: Boolean(option?.disabled),
  };
}

function joinClassNames(...values) {
  return values.filter(Boolean).join(" ");
}

function getNextEnabledIndex(options, startIndex, step) {
  for (let index = startIndex; index >= 0 && index < options.length; index += step) {
    if (!options[index]?.disabled) {
      return index;
    }
  }

  return -1;
}

function ThemedSelect({
  id,
  name,
  value,
  defaultValue = "",
  options = [],
  placeholder = "Select an option",
  disabled = false,
  onChange,
  className = "",
  triggerClassName = "",
  menuClassName = "",
  optionClassName = "",
  ariaLabel,
  ariaLabelledBy,
  emptyMessage = "No options available",
  resetAfterSelect = false,
}) {
  const generatedId = useId();
  const selectId = id || `themed-select-${generatedId}`;
  const listboxId = `${selectId}-listbox`;
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState(null);
  const normalizedOptions = options.map(normalizeOption);
  const selectedValue = normalizeValue(isControlled ? value : uncontrolledValue);
  const selectedIndex = normalizedOptions.findIndex(
    (option) => normalizeValue(option.value) === selectedValue,
  );
  const selectedOption = selectedIndex >= 0 ? normalizedOptions[selectedIndex] : null;
  const firstEnabledIndex = getNextEnabledIndex(normalizedOptions, 0, 1);
  const lastEnabledIndex = getNextEnabledIndex(normalizedOptions, normalizedOptions.length - 1, -1);

  const updateMenuPosition = useEffectEvent(() => {
    if (!buttonRef.current) {
      return;
    }

    const viewportPadding = 8;
    const gutter = 8;
    const rect = buttonRef.current.getBoundingClientRect();
    const estimatedHeight = Math.min(Math.max(normalizedOptions.length, 1) * 52 + 16, 320);
    const availableBelow = Math.max(140, window.innerHeight - rect.bottom - viewportPadding * 2);
    const availableAbove = Math.max(140, rect.top - viewportPadding * 2);
    const shouldOpenUpward =
      availableBelow < Math.min(estimatedHeight, 220) && availableAbove > availableBelow;
    const width = Math.min(rect.width, window.innerWidth - viewportPadding * 2);
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      window.innerWidth - width - viewportPadding,
    );

    setMenuPosition(
      shouldOpenUpward
        ? {
            left,
            width,
            top: "auto",
            bottom: window.innerHeight - rect.top + gutter,
            maxHeight: Math.min(320, availableAbove),
          }
        : {
            left,
            width,
            top: rect.bottom + gutter,
            bottom: "auto",
            maxHeight: Math.min(320, availableBelow),
          },
    );
  });

  useLayoutEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    updateMenuPosition();

    const handleLayout = () => {
      updateMenuPosition();
    };

    window.addEventListener("resize", handleLayout);
    window.addEventListener("scroll", handleLayout, true);

    return () => {
      window.removeEventListener("resize", handleLayout);
      window.removeEventListener("scroll", handleLayout, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      const target = event.target;

      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      setIsOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) {
      return;
    }

    menuRef.current
      ?.querySelector(`[data-option-index="${highlightedIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, isOpen]);

  function openMenu(preferredIndex) {
    if (disabled) {
      return;
    }

    const nextIndex =
      typeof preferredIndex === "number" && preferredIndex >= 0
        ? preferredIndex
        : selectedIndex >= 0
          ? selectedIndex
          : firstEnabledIndex;

    setHighlightedIndex(nextIndex);
    setIsOpen(true);
  }

  function closeMenu({ restoreFocus = false } = {}) {
    setIsOpen(false);

    if (restoreFocus) {
      requestAnimationFrame(() => {
        buttonRef.current?.focus();
      });
    }
  }

  function commitSelection(option) {
    if (!option || option.disabled) {
      return;
    }

    const nextValue = normalizeValue(option.value);

    if (!isControlled) {
      setUncontrolledValue(resetAfterSelect ? defaultValue : nextValue);
    }

    onChange?.(nextValue, option);
    closeMenu({ restoreFocus: true });
  }

  function handleTriggerKeyDown(event) {
    if (disabled) {
      return;
    }

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();

        if (!isOpen) {
          openMenu();
          return;
        }

        setHighlightedIndex((current) => {
          const nextIndex = getNextEnabledIndex(
            normalizedOptions,
            current < 0 ? 0 : current + 1,
            1,
          );

          return nextIndex >= 0 ? nextIndex : current;
        });
        return;
      }
      case "ArrowUp": {
        event.preventDefault();

        if (!isOpen) {
          openMenu(lastEnabledIndex);
          return;
        }

        setHighlightedIndex((current) => {
          const nextIndex = getNextEnabledIndex(
            normalizedOptions,
            current < 0 ? normalizedOptions.length - 1 : current - 1,
            -1,
          );

          return nextIndex >= 0 ? nextIndex : current;
        });
        return;
      }
      case "Home":
        if (isOpen) {
          event.preventDefault();
          setHighlightedIndex(firstEnabledIndex);
        }
        return;
      case "End":
        if (isOpen) {
          event.preventDefault();
          setHighlightedIndex(lastEnabledIndex);
        }
        return;
      case "Enter":
      case " ": {
        event.preventDefault();

        if (!isOpen) {
          openMenu();
          return;
        }

        if (highlightedIndex >= 0) {
          commitSelection(normalizedOptions[highlightedIndex]);
        }
        return;
      }
      case "Tab":
        if (isOpen) {
          setIsOpen(false);
        }
        return;
      default:
        return;
    }
  }

  return (
    <div className={joinClassNames("themed-select", isOpen ? "is-open" : "", className)}>
      {name ? <input type="hidden" name={name} value={selectedValue} /> : null}

      <button
        ref={buttonRef}
        id={selectId}
        type="button"
        className={joinClassNames(
          "themed-select__trigger",
          !selectedOption ? "is-placeholder" : "",
          triggerClassName,
        )}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => {
          if (isOpen) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="themed-select__value">{selectedOption?.label || placeholder}</span>
        <span className="themed-select__chevron" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6.25 8 10l4-3.75"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {isOpen && menuPosition
        ? createPortal(
            <div
              ref={menuRef}
              id={listboxId}
              className={joinClassNames("themed-select__menu", menuClassName)}
              role="listbox"
              aria-labelledby={selectId}
              style={menuPosition}
            >
              {normalizedOptions.length > 0 ? (
                normalizedOptions.map((option, index) => {
                  const isSelected = normalizeValue(option.value) === selectedValue;
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <button
                      key={`${selectId}-${option.value}-${index}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      data-option-index={index}
                      className={joinClassNames(
                        "themed-select__option",
                        isSelected ? "is-selected" : "",
                        isHighlighted ? "is-highlighted" : "",
                        optionClassName,
                      )}
                      onMouseEnter={() => {
                        if (!option.disabled) {
                          setHighlightedIndex(index);
                        }
                      }}
                      onClick={() => commitSelection(option)}
                    >
                      <span className="themed-select__option-label">{option.label}</span>
                      {option.description ? (
                        <span className="themed-select__option-description">
                          {option.description}
                        </span>
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <div className="themed-select__empty">{emptyMessage}</div>
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export default ThemedSelect;
