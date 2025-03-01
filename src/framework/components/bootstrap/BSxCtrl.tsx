import React, { ReactNode, useEffect, useState } from "react";
import {
  Badge,
  Form,
  FormCheckProps,
  FormControlProps,
  FormSelectProps,
} from "react-bootstrap";
import { BsPrefixProps, ReplaceProps } from "react-bootstrap/esm/helpers";
import {
  CsCheckBoxItem,
  CsHasOptionsItem,
  CsInputNumberItem,
  CsInputPasswordItem,
  CsInputTextItem,
  CsItem,
  CsItemBase,
  CsMultiCheckBoxItem,
  CsRadioBoxItem,
  CsSelectBoxItem,
  CsSelectNumberBoxItem,
  CsTextAreaItem,
} from "../../logics";
import { ValidationError } from "../validation/ValidationError";
import "./BSxCtrl.css";

export interface BSxProps<I extends CsItemBase> {
  item: I;
  hideLabel?: boolean;
  labelPlacement?: "top" | "left";
  labelWidth?: 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50;
  showRequiredTag?: "both" | "required" | "optional" | "none";
  addClassNames?: string[];
}

interface BSxLabelProp {
  label: string | ReactNode;
  color?: string;
}

export const BSxLabel = (props: BSxLabelProp) => {
  const color = props.color ?? "#e9900c";
  return (
    <div className="label">
      <Form.Label style={{ color: color }}>{props.label}</Form.Label>
    </div>
  );
};

export const getClassName = <T,>(
  props: BSxProps<CsItem<T>>,
  add?: string,
): string => {
  let names = ["bsx-ctrl"];
  const item = props.item;
  if (add) {
    names.push(add);
  }
  if (props.addClassNames) {
    names = names.concat(props.addClassNames);
  }
  if (item.hasValidationError) {
    names.push("validation-error");
  }
  if (item.isReadonly()) {
    names.push("readonly");
  }
  return names.join(" ");
};

export const getLabel = <T,>(
  item: CsItem<T>,
  showRequiredTag?: "both" | "required" | "optional" | "none",
): ReactNode => {
  const required = item.validationRule?.required ?? false;
  const showTag = showRequiredTag ?? (item.parentView ? "both" : "none");
  const requiredTag = () => {
    switch (showTag) {
      case "both":
        return (
          <Badge pill bg="light" text={required ? "danger" : "secondary"}>
            {required ? "必須" : "任意"}
          </Badge>
        );
      case "required":
        return (
          required && (
            <Badge pill bg="light" text="danger">
              {"必須"}
            </Badge>
          )
        );
      case "optional":
        return (
          !required && (
            <Badge pill bg="light" text="secondary">
              {"任意"}
            </Badge>
          )
        );
    }
  };
  return (
    <span>
      {item.label}
      {requiredTag()}
    </span>
  );
};

export interface BSxEditCtrlProps<T extends CsItemBase> {
  bsxProps: BSxProps<T>;
  renderCtrl: (
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>,
  ) => ReactNode;
}

export const BSxEditCtrl = <T,>(props: BSxEditCtrlProps<CsItem<T>>) => {
  const { bsxProps, renderCtrl } = props;
  const { item, showRequiredTag } = bsxProps;
  const hideLabel = bsxProps.hideLabel ?? false;
  const labelPlacement = bsxProps.labelPlacement ?? "top";
  const labelWidth = bsxProps.labelWidth ?? 30;
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [item.hasValidationError, refresh]);

  return labelPlacement === "left" ? (
    <div>
      <div className={"input-container"}>
        {hideLabel ? (
          <div style={{ width: "100%" }}>{renderCtrl(setRefresh)}</div>
        ) : (
          <>
            <div style={{ width: labelWidth + "%" }}>
              <BSxLabel label={getLabel(item, showRequiredTag)}></BSxLabel>
            </div>
            <div style={{ width: 100 - labelWidth + "%" }}>
              {renderCtrl(setRefresh)}
            </div>
          </>
        )}
      </div>
      <div className={"input-container"}>
        <div style={{ width: hideLabel ? 0 : labelWidth + "%" }}></div>
        <ValidationError
          key={"validation-error-" + item.key}
          message={item.validationErrorMessage}
        />
      </div>
    </div>
  ) : (
    <div>
      {!hideLabel && (
        <BSxLabel label={getLabel(item, showRequiredTag)}></BSxLabel>
      )}
      {renderCtrl(setRefresh)}
      <ValidationError
        key={"validation-error-" + item.key}
        message={item.validationErrorMessage}
      />
    </div>
  );
};

export interface BSxInputTextProps extends BSxProps<CsInputTextItem> {
  bsProps?: React.PropsWithChildren<
    ReplaceProps<"input", BsPrefixProps<"input"> & FormControlProps>
  >;
}

export const BSxInputText = (props: BSxInputTextProps) => {
  const { item, bsProps } = props;
  return (
    <BSxEditCtrl
      bsxProps={props}
      renderCtrl={(setRefresh) => (
        <Form.Control
          className={getClassName(props)}
          as="input"
          value={item.value}
          readOnly={item.isReadonly()}
          onChange={(e) => {
            item.setValue(e.target.value);
            if (!item.validateWhenErrorExists(e.target.value)) {
              setRefresh(true);
            }
          }}
          onBlur={() => {
            if (item.parentView?.validateTrigger !== "onBlur") {
              return;
            }
            if (!item.validate(item.value)) {
              setRefresh(true);
            }
          }}
          {...bsProps}
        />
      )}
    /> // BSxEditCtrl
  );
};

export interface BSxInputNumberProps extends BSxProps<CsInputNumberItem> {
  bsProps?: React.PropsWithChildren<
    ReplaceProps<"input", BsPrefixProps<"input"> & FormControlProps>
  >;
}

export const BSxInputNumber = (props: BSxInputNumberProps) => {
  const { item, bsProps } = props;
  return (
    <BSxEditCtrl
      bsxProps={props}
      renderCtrl={(setRefresh) => (
        <Form.Control
          className={getClassName(props, "input-number")}
          type="number"
          value={item.value}
          readOnly={item.isReadonly()}
          onChange={(e) => {
            const newValue = e.target.value ? e.target.value : undefined;
            const newNumber = newValue ? Number(newValue) : undefined;
            item.setValue(newNumber);
            if (!item.validateWhenErrorExists(newNumber as number)) {
              setRefresh(true);
            }
          }}
          onBlur={() => {
            if (item.parentView?.validateTrigger !== "onBlur") {
              return;
            }
            if (!item.validate(item.value)) {
              setRefresh(true);
            }
          }}
          {...bsProps}
        />
      )}
    /> // BSxEditCtrl
  );
};

export interface BSxInputPasswordProps extends BSxProps<CsInputPasswordItem> {
  bsProps?: React.PropsWithChildren<
    ReplaceProps<"input", BsPrefixProps<"input"> & FormControlProps>
  >;
}

export const BSxInputPassword = (props: BSxInputPasswordProps) => {
  const { item, bsProps } = props;
  return (
    <BSxEditCtrl
      bsxProps={props}
      renderCtrl={(setRefresh) => (
        <Form.Control
          className={getClassName(props)}
          type="password"
          value={item.value}
          readOnly={item.isReadonly()}
          onChange={(e) => {
            item.setValue(e.target.value);
            if (!item.validateWhenErrorExists(e.target.value)) {
              setRefresh(true);
            }
          }}
          onBlur={() => {
            if (item.parentView?.validateTrigger !== "onBlur") {
              return;
            }
            if (!item.validate(item.value)) {
              setRefresh(true);
            }
          }}
          {...bsProps}
        />
      )}
    /> // BSxEditCtrl
  );
};

export interface BSxTextAreaProps extends BSxProps<CsTextAreaItem> {
  bsProps?: React.PropsWithChildren<
    ReplaceProps<"input", BsPrefixProps<"input"> & FormControlProps>
  >;
}

export const BSxTextArea = (props: BSxTextAreaProps) => {
  const { item, bsProps } = props;
  return (
    <BSxEditCtrl
      bsxProps={props}
      renderCtrl={(setRefresh) => (
        <Form.Control
          className={getClassName(props, "textarea")}
          as="textarea"
          value={item.value}
          readOnly={item.isReadonly()}
          onChange={(e) => {
            item.setValue(e.target.value);
            if (!item.validateWhenErrorExists(e.target.value)) {
              setRefresh(true);
            }
          }}
          onBlur={() => {
            if (item.parentView?.validateTrigger !== "onBlur") {
              return;
            }
            if (!item.validate(item.value)) {
              setRefresh(true);
            }
          }}
          {...bsProps}
        />
      )}
    /> // BSxEditCtrl
  );
};

interface BSxSelectBoxCommonProps<
  V extends string | number,
  T extends CsHasOptionsItem<V>,
> extends BSxProps<T> {
  bsProps?: React.PropsWithChildren<
    ReplaceProps<"select", BsPrefixProps<"select"> & FormSelectProps>
  >;
}

const BSxSelectBoxCommon = <
  V extends string | number,
  T extends CsHasOptionsItem<V>,
>(
  props: BSxSelectBoxCommonProps<V, T>,
  toValue: (value: string) => V | undefined,
) => {
  const { item, bsProps } = props;
  return (
    <BSxEditCtrl
      bsxProps={props}
      renderCtrl={(setRefresh) => (
        <Form.Select
          className={getClassName(props, "fit-content")}
          value={item.value}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const newValue = e.target.value;
            item.setValue(toValue(newValue));
            if (!item.validateWhenErrorExists(toValue(newValue) as V)) {
              setRefresh(true);
            }
          }}
          onBlur={() => {
            if (item.parentView?.validateTrigger !== "onBlur") {
              return;
            }
            if (!item.validate(item.value)) {
              setRefresh(true);
            }
          }}
          {...bsProps}
        >
          {(item.value === undefined || item.value === "") && (
            <option key="" value="" disabled={true} />
          )}
          {item.options.map((o) => {
            const value = o[item.optionValueKey];
            const label = o[item.optionLabelKey];
            return !item.isReadonly() ||
              (item.isReadonly() && item.value === value) ? (
              <option key={value} value={value}>
                {label}
              </option>
            ) : null;
          })}
        </Form.Select>
      )}
    /> // BSxEditCtrl
  );
};

export interface BSxSelectBoxProps
  extends BSxSelectBoxCommonProps<string, CsSelectBoxItem> {
  bsProps?: React.PropsWithChildren<
    ReplaceProps<"select", BsPrefixProps<"select"> & FormSelectProps>
  >;
}

export const BSxSelectBox = (props: BSxSelectBoxProps) => {
  return BSxSelectBoxCommon<string, CsSelectBoxItem>(
    props,
    (value: string) => value,
  );
};

export interface BSxSelectNumberBoxProps
  extends BSxSelectBoxCommonProps<number, CsSelectNumberBoxItem> {
  bsProps?: React.PropsWithChildren<
    ReplaceProps<"select", BsPrefixProps<"select"> & FormSelectProps>
  >;
}

export const BSxSelectNumberBox = (props: BSxSelectNumberBoxProps) => {
  return BSxSelectBoxCommon<number, CsSelectNumberBoxItem>(
    props,
    (value: string) => (value ? Number(value) : undefined),
  );
};

export interface BSxRadioBoxProps extends BSxProps<CsRadioBoxItem> {
  bsProps?: React.PropsWithChildren<
    ReplaceProps<"input", BsPrefixProps<"input"> & FormCheckProps>
  >;
}

export const BSxRadioBox = (props: BSxRadioBoxProps) => {
  const { item, bsProps } = props;
  return (
    <BSxEditCtrl
      bsxProps={props}
      renderCtrl={(setRefresh) => (
        <Form.Group
          className={getClassName(props, "fit-content checkbox-area")}
          {...bsProps}
          defaultValue={item.value}
          onBlur={() => {
            if (item.parentView?.validateTrigger !== "onBlur") {
              return;
            }
            if (!item.validate(item.value)) {
              setRefresh(true);
            }
          }}
        >
          {item.options.map((o) => {
            const value = o[item.optionValueKey];
            const label = o[item.optionLabelKey];
            return (
              <Form.Check
                className="checkbox-item"
                key={value}
                type="radio"
                value={value}
                label={label}
                disabled={item.isReadonly() && item.value !== value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  item.setValue(e.target.value);
                  if (!item.validateWhenErrorExists(e.target.value)) {
                    setRefresh(true);
                  }
                }}
                checked={item.value === value}
                {...bsProps}
              />
            );
          })}
        </Form.Group>
      )}
    /> // BSxEditCtrl
  );
};

export interface BSxCheckBoxProps extends BSxProps<CsCheckBoxItem> {
  bsProps?: React.PropsWithChildren<
    ReplaceProps<"input", BsPrefixProps<"input"> & FormCheckProps>
  >;
}

export const BSxCheckBox = (props: BSxCheckBoxProps) => {
  const { item, bsProps } = props;
  return (
    <BSxEditCtrl
      bsxProps={props}
      renderCtrl={(setRefresh) => (
        <Form.Group
          className={getClassName(props, "fit-content")}
          onBlur={() => {
            if (item.parentView?.validateTrigger !== "onBlur") {
              return;
            }
            if (!item.validate(item.value)) {
              setRefresh(true);
            }
          }}
          {...bsProps}
        >
          <Form.Check
            type="checkbox"
            label={item.checkBoxText}
            defaultChecked={item.isChecked()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              item.setValue(e.target.checked);
            }}
            disabled={item.isReadonly()}
            {...bsProps}
          />
        </Form.Group>
      )}
    /> // BSxEditCtrl
  );
};

export interface BSxMultiCheckBoxProps extends BSxProps<CsMultiCheckBoxItem> {
  bsProps?: React.PropsWithChildren<
    ReplaceProps<"input", BsPrefixProps<"input"> & FormCheckProps>
  >;
}

export const BSxMultiCheckBox = (props: BSxMultiCheckBoxProps) => {
  const { item, bsProps } = props;
  return (
    <BSxEditCtrl
      bsxProps={props}
      renderCtrl={(setRefresh) => (
        <Form.Group
          className={getClassName(props, "fit-content checkbox-area")}
          onBlur={() => {
            if (item.parentView?.validateTrigger !== "onBlur") {
              return;
            }
            if (!item.validate(item.value)) {
              setRefresh(true);
            }
          }}
        >
          {item.options.map((o) => {
            const value = o[item.optionValueKey];
            const text = o[item.optionLabelKey];
            return (
              <Form.Check
                className="checkbox-item"
                key={value}
                value={value}
                type="checkbox"
                defaultChecked={item.value?.includes(value)}
                label={text}
                onChange={(e) => {
                  if (item.isReadonly()) return;
                  let newValue: string[];
                  if (e.target.checked) {
                    newValue = item.value ? item.value?.concat(value) : [];
                  } else {
                    newValue = item.value
                      ? item.value?.filter((v) => v !== value)
                      : [];
                  }
                  item.setValue(newValue);
                  if (!item.validateWhenErrorExists(newValue)) {
                    setRefresh(true);
                  }
                }}
                disabled={item.isReadonly() && !item.value?.includes(value)}
                {...bsProps}
              />
            );
          })}
        </Form.Group>
      )}
    /> // BSxEditCtrl
  );
};
