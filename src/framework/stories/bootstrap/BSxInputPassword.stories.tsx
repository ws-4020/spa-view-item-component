// BSxInputPassword の Story ファイル
import { Meta, StoryObj } from "@storybook/react";
import {
  BSxButton,
  BSxCheckBox,
  BSxInputNumberRange,
  BSxInputPassword,
  BSxInputPasswordProps,
  BSxInputText,
} from "../../components/bootstrap";
import {
  numberRule,
  RW,
  stringRule,
  useCsCheckBoxItem,
  useCsInputNumberRangeItem,
  useCsInputPasswordItem,
  useCsInputTextItem,
  useCsView,
  useInit,
} from "../../logics";

/**
 * BootstrapのForm.Controlをラップしたコンポーネントであり、ラベル表示、バリデーション表示、イベントハンドラなどの主要な機能が内部に実装されています。
 */
const meta: Meta<typeof BSxInputPassword> = {
  title: "Bootstrap/BSxInputPassword",
  component: BSxInputPassword,
  tags: ["autodocs"],
  argTypes: {
    item: {
      control: false,
      description:
        "入力項目定義を指定します。ラベル名、入力フィールドの初期値、バリデーションルール、読み取り専用にするかの設定ができます。",
      table: {
        type: { summary: "CsInputPasswordItem" },
      },
    },
    hideLabel: {
      control: "boolean",
      description: "ラベルの表示有無を指定します。",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    labelPlacement: {
      control: "radio",
      description:
        "入力フィールドに対するラベルの位置を指定します。`hideLabel`が`false`の場合にのみ適用されます。",
      table: {
        defaultValue: { summary: "top" },
      },
    },
    labelWidth: {
      control: "select",
      description:
        "ラベルの幅を親要素の`width`に対するパーセンテージ（％）で指定します。`hideLabel`が`false`かつ`labelPlacement`が`left`の場合にのみ適用されます。",
      table: {
        defaultValue: { summary: "30" },
      },
    },
    showRequiredTag: {
      control: "radio",
      description:
        "必須タグ/任意タグの表示有無を指定します。`required`の場合は必須タグのみ、" +
        "`optional`の場合は任意タグのみ表示されます。`both`の場合は必須と任意両方のタグが表示されます。" +
        "`none`の場合はタグが表示されません。<br>" +
        "必須か任意かは、バリデーションルール関数の第一引数が`true`であるかに依存します。",
    },
    addClassNames: {
      control: false,
      description: `追加するCSSのクラス名を指定します。CSSのクラス名は複数指定することができます。<br><br>定義例：\`addClassNames={["css-style1", "css-style2"]}\``,
    },
    bsProps: {
      control: false,
      description: `BootstrapのForm.Controlコンポーネントに渡すプロパティを指定します。
                <a href="https://getbootstrap.com/docs/5.1/forms/form-control/" target="_blank">詳細</a><br><br>定義例：\`bsProps={{ styles: { color: "white" } }}\``,
      table: {
        type: {
          summary: `PropsWithChildren<ReplaceProps<"input", BsPrefixProps<"input"> & FormControlProps>>`,
        },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs: Partial<BSxInputPasswordProps> = {
  item: undefined,
  hideLabel: false,
  labelPlacement: "top",
  labelWidth: 30,
  showRequiredTag: "both",
};

/**
 * BSxInputPasswordコンポーネントのサンプル。
 */
export const InputPassword: Story = {
  args: defaultArgs,
  render: function Render(args: BSxInputPasswordProps) {
    const item = useCsInputPasswordItem(
      "ラベル",
      useInit(""),
      stringRule(true),
    );

    return <BSxInputPassword {...args} item={item} />;
  },
  tags: ["!autodocs", "!dev"],
  parameters: {
    docs: {
      source: {
        code: `const view = useCsView({
  item: useCsInputPasswordItem("ラベル", useInit(""), stringRule(true));
return (
  <BSxInputPassword
    item={view.item}
  />
);`,
      },
    },
  },
};

const CustomizeItemParameters = () => {
  const label = useCsInputTextItem(
    "ラベル名",
    useInit("ラベル"),
    stringRule(true),
  );
  const init = useCsInputTextItem(
    "初期値  ※カスタマイズ不可",
    useInit("password"),
    stringRule(true),
    RW.Readonly,
  );
  const required = useCsCheckBoxItem(
    "必須/任意設定",
    useInit(true),
    "必須入力にする",
  );
  const range = useCsInputNumberRangeItem(
    "文字数範囲",
    useInit([0, 10]),
    numberRule(false),
  );
  const readOnly = useCsCheckBoxItem(
    "読み取り専用設定",
    useInit(false),
    "読み取り専用にする",
  );
  const targetItem = useCsInputPasswordItem(
    label.value ?? "",
    useInit(init.value),
    stringRule(!!required.value, range.lowerValue, range.upperValue),
    readOnly.value ? RW.Readonly : RW.Editable,
  );
  const view = useCsView({ item: targetItem });

  return (
    <>
      <BSxInputPassword item={targetItem} />
      <hr />
      <BSxInputText item={label} />
      <BSxInputText item={init} />
      <BSxInputNumberRange
        item={range}
        bsPropsLower={{ min: 1 }}
        bsPropsUpper={{ min: 1 }}
      />
      <BSxCheckBox item={required} />
      <BSxCheckBox item={readOnly} />
      <BSxButton type="primary" validationViews={[view]} onClick={() => {}}>
        バリデーションを実行する
      </BSxButton>
    </>
  );
};

/**
 * Itemのパラメータの値をカスタマイズすることで、入力項目のUIがどのように変化するのかを確認することができます。
 */
export const CustomizeItemParametersStory = {
  render: function Render() {
    return <CustomizeItemParameters />;
  },
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `const view = useCsView({
  item: useCsInputPasswordItem("ラベル", useInit("password"), stringRule(true));
return (
  <BSxInputPassword
    item={view.item}
  />
);`,
      },
    },
  },
};
