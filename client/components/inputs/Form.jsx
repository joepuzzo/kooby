import React from "react";
import { useForm } from "informed";
import { Form as SpectrumForm } from "@react-spectrum/s2";

export const Form = ({ children, ...rest }) => {
  const { formController, render, userProps } = useForm(rest);

  return render(
    <SpectrumForm
      {...userProps}
      onReset={formController.reset}
      onSubmit={formController.submitForm}
      onKeyDown={formController.keyDown}
    >
      {children}
    </SpectrumForm>,
  );
};
