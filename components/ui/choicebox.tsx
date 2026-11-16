"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./choicebox.module.css";

export interface ChoiceboxOption {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  disabled?: boolean;
}

interface ChoiceboxBase extends Omit<ComponentProps<"fieldset">, "children" | "onChange"> {
  legend: ReactNode;
  options: readonly ChoiceboxOption[];
}

export type ChoiceboxProps = ChoiceboxBase & (
  | { multiple?: false; value?: string | null; onChange: (id: string) => void }
  | { multiple: true; value?: readonly string[]; onChange: (ids: string[]) => void }
);

export function Choicebox(props: ChoiceboxProps) {
  const groupId = useId();
  const { name = groupId, legend, options, className, multiple, value, onChange, ...fieldsetProps } = props;

  function change(id: string, checked: boolean) {
    if (multiple) {
      const selected = value ?? [];
      onChange(checked ? [...selected, id] : selected.filter(optionId => optionId !== id));
    } else if (checked) {
      onChange(id);
    }
  }

  return (
    <fieldset data-slot="choicebox" className={cn(styles.group, className)} {...fieldsetProps}>
      <legend className={styles.legend}>{legend}</legend>
      <div data-slot="choicebox-options" className={styles.options}>
        {options.map((option, index) => {
          const id = `${groupId}-${index}`;
          const descriptionIds = [option.description && `${id}-description`, option.meta && `${id}-meta`]
            .filter(Boolean).join(" ");
          const checked = multiple ? value?.includes(option.id) ?? false : value === option.id;

          return (
            <label key={option.id} className={styles.choice} data-slot="choicebox-option">
              <input
                type={multiple ? "checkbox" : "radio"}
                name={name}
                value={option.id}
                className={styles.input}
                checked={checked}
                disabled={option.disabled}
                aria-labelledby={`${id}-title`}
                aria-describedby={descriptionIds || undefined}
                onChange={event => change(option.id, event.currentTarget.checked)}
              />
              <span aria-hidden="true" className={styles.indicator} data-slot="choicebox-indicator" />
              <span className={styles.copy}>
                <span id={`${id}-title`} className={styles.title}>{option.title}</span>
                {option.description && (
                  <span id={`${id}-description`} className={styles.description}>{option.description}</span>
                )}
              </span>
              {option.meta && <span id={`${id}-meta`} className={styles.meta}>{option.meta}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default Choicebox;
