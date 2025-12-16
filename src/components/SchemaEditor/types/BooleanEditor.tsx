import { useId } from "react";
import { Label } from "../../../components/ui/label.tsx";
import { Switch } from "../../../components/ui/switch.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select.tsx";
import { useTranslation } from "../../../hooks/use-translation.ts";
import type { ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import {
  isBooleanSchema,
  withObjectSchema,
} from "../../../types/jsonSchema.ts";
import type { TypeEditorProps } from "../TypeEditor.tsx";

const BooleanEditor: React.FC<TypeEditorProps> = ({
  schema,
  onChange,
  readOnly = false,
}) => {
  const t = useTranslation();
  const allowTrueId = useId();
  const allowFalseId = useId();

  // Extract boolean-specific validation
  const enumValues = withObjectSchema(
    schema,
    (s) => s.enum as boolean[] | undefined,
    null,
  );
  const defaultValue = withObjectSchema(
    schema,
    (s) => s.default as boolean | undefined,
    undefined,
  );

  // Determine if we have enum restrictions
  const hasRestrictions = Array.isArray(enumValues);
  const allowsTrue = !hasRestrictions || enumValues?.includes(true) || false;
  const allowsFalse = !hasRestrictions || enumValues?.includes(false) || false;

  // Handle changing the allowed values
  const handleAllowedChange = (value: boolean, allowed: boolean) => {
    let newEnum: boolean[] | undefined;

    if (allowed) {
      // If allowing this value
      if (!hasRestrictions) {
        // No current restrictions, nothing to do
        return;
      }

      if (enumValues?.includes(value)) {
        // Already allowed, nothing to do
        return;
      }

      // Add this value to enum
      newEnum = enumValues ? [...enumValues, value] : [value];

      // If both are now allowed, we can remove the enum constraint
      if (newEnum.includes(true) && newEnum.includes(false)) {
        newEnum = undefined;
      }
    } else {
      // If disallowing this value
      if (hasRestrictions && !enumValues?.includes(value)) {
        // Already disallowed, nothing to do
        return;
      }

      // Create a new enum with just the opposite value
      newEnum = [!value];
    }

    // Create a new validation object with just the type and enum
    const updatedValidation: ObjectJSONSchema = {
      type: "boolean",
    };

    if (newEnum) {
      updatedValidation.enum = newEnum;
    } else {
      // Remove enum property if no restrictions
      onChange({ type: "boolean" });
      return;
    }

    onChange(updatedValidation);
  };

  const hasEnum = enumValues && enumValues.length > 0;

  // Handle default value change
  const handleDefaultChange = (value: string) => {
    const baseSchema = isBooleanSchema(schema)
      ? { type: "boolean" as const }
      : { ...schema };

    const { type: _, description: __, ...rest } = baseSchema;

    const updatedSchema: ObjectJSONSchema = {
      ...rest,
      type: "boolean",
    };

    if (value === "true") {
      updatedSchema.default = true;
    } else if (value === "false") {
      updatedSchema.default = false;
    } else {
      // Remove default if "none"
      const { default: _, ...withoutDefault } = updatedSchema;
      onChange(withoutDefault as ObjectJSONSchema);
      return;
    }

    onChange(updatedSchema);
  };

  const defaultValueId = useId();
  const defaultValueDisplay =
    defaultValue === true ? "true" : defaultValue === false ? "false" : "none";

  return (
    <div className="space-y-4">
      {(!readOnly || defaultValue !== undefined) && (
        <div className="space-y-2 pb-2 border-b border-border/40">
          <Label htmlFor={defaultValueId} className="text-foreground">
            {t.defaultValueLabel}
          </Label>
          <Select
            value={defaultValueDisplay}
            onValueChange={handleDefaultChange}
            disabled={readOnly}
          >
            <SelectTrigger id={defaultValueId} className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t.defaultValueNone}</SelectItem>
              <SelectItem value="true">{t.defaultValueTrue}</SelectItem>
              <SelectItem value="false">{t.defaultValueFalse}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {readOnly && !hasEnum && (
        <p className="text-sm text-muted-foreground italic">
          {t.booleanNoConstraint}
        </p>
      )}
      {(!readOnly || !allowsTrue || !allowsFalse) && (
        <div className="space-y-2 pt-2">
          {(!readOnly || hasEnum) && (
            <>
              <Label>Allowed Values</Label>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={allowTrueId}
                    checked={allowsTrue}
                    disabled={readOnly}
                    onCheckedChange={(checked) =>
                      handleAllowedChange(true, checked)
                    }
                  />
                  <Label htmlFor={allowTrueId} className="cursor-pointer">
                    {t.booleanAllowTrueLabel}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id={allowFalseId}
                    checked={allowsFalse}
                    disabled={readOnly}
                    onCheckedChange={(checked) =>
                      handleAllowedChange(false, checked)
                    }
                  />
                  <Label htmlFor={allowFalseId} className="cursor-pointer">
                    {t.booleanAllowFalseLabel}
                  </Label>
                </div>
              </div>
            </>
          )}

          {!allowsTrue && !allowsFalse && (
            <p className="text-xs text-amber-600 mt-2">
              {t.booleanNeitherWarning}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BooleanEditor;
