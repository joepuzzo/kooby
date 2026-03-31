import { useField } from "informed";
import { TextArea as SpectrumTextArea } from "@react-spectrum/s2";

/**
 * Informed-connected Spectrum 2 TextArea.
 * @see https://react-spectrum.adobe.com/TextArea
 */
export const TextArea = (props) => {
  const { render, informed, fieldState, fieldApi, userProps, ref } = useField({
    type: "textArea",
    ...props,
  });
  const { required, disabled, ...rest } = userProps;
  const restUserProps = { ...rest };
  delete restUserProps.type;
  const { error, showError } = fieldState;
  const invalid = !!(showError && error);

  return render(
    <SpectrumTextArea
      ref={ref}
      isInvalid={invalid}
      errorMessage={invalid ? error : undefined}
      isRequired={!!required}
      isDisabled={!!disabled}
      {...restUserProps}
      {...informed}
      onChange={(value) => fieldApi.setValue(value)}
    />,
  );
};
