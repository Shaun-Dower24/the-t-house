"use client";

import { Choicebox } from "@/components/ui/choicebox";
import { ContactForm, type ContactFormProps } from "@/components/ui/contact-form";
import styles from "./contact-01.module.css";

interface ContactOption {
  label: string;
}

export interface Contact01Props<Option extends ContactOption> extends Omit<ContactFormProps, "details"> {
  options: readonly Option[];
  selectedOption: Option;
  onOptionChange: (option: Option) => void;
}

export function Contact01<Option extends ContactOption>({
  options, selectedOption, onOptionChange, ...props
}: Contact01Props<Option>) {
  return (
    <ContactForm
      {...props}
      details={options.length > 0 ? (
        <Choicebox
          legend="Enquiry type"
          options={options.map(option => ({ id: option.label, title: option.label }))}
          value={selectedOption.label}
          onChange={label => {
            const option = options.find(item => item.label === label);
            if (option) onOptionChange(option);
          }}
          className={styles.topics}
        />
      ) : null}
    />
  );
}

export default Contact01;
