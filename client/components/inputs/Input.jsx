import { useField } from "informed";
import { TextField } from "@react-spectrum/s2";

/**
 * Informed-connected Spectrum 2 TextField.
 * @see https://react-spectrum.adobe.com/TextField
 */
export const Input = ({ hidden, ...props }) => {
  const { render, informed, fieldState, fieldApi, userProps, ref } = useField({
    type: "text",
    ...props,
  });
  const { required, disabled, type: typeProp, ...rest } = userProps;
  const { error, showError } = fieldState;
  const invalid = !!(showError && error);

  if (hidden) {
    return render(<input ref={ref} type="hidden" {...informed} />);
  }

  return render(
    <TextField
      ref={ref}
      isInvalid={invalid}
      errorMessage={invalid ? error : undefined}
      isRequired={!!required}
      isDisabled={!!disabled}
      {...rest}
      {...informed}
      onChange={(value) => fieldApi.setValue(value)}
      type={typeProp ?? informed.type}
    />,
  );
};
