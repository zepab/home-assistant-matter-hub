import {
  BridgeConfig,
  bridgeConfigSchema,
} from "@home-assistant-matter-hub/common";
import { useCallback, useState } from "react";
import ReactCodeMirror, { hoverTooltip } from "@uiw/react-codemirror";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { Alert, Button, useTheme } from "@mui/material";
import { linter } from "@codemirror/lint";
import { json, jsonLanguage, jsonParseLinter } from "@codemirror/lang-json";
import {
  handleRefresh,
  jsonCompletion,
  jsonSchemaHover,
  jsonSchemaLinter,
  stateExtensions,
} from "codemirror-json-schema";
import Box from "@mui/material/Box";
import Ajv from "ajv";
import _ from "lodash";

export interface BridgeConfigEditorProps {
  bridgeId?: string;
  config: BridgeConfig | undefined;
  usedPorts: Record<number, string>;
  onChange: (config: BridgeConfig | undefined, isValid: boolean) => void;
}

const defaultConfig: (port: number) => BridgeConfig = (port) => ({
  name: "",
  port: port,
  filter: {
    include: [],
    exclude: [],
  },
});

const ajv = new Ajv();

export const BridgeConfigEditor = ({
  config: inputConfig,
  bridgeId,
  usedPorts,
  onChange,
}: BridgeConfigEditorProps) => {
  const codeMirrorTheme = useCodeTheme();

  const [configValue, setConfigValue] = useState<string>(() =>
    JSON.stringify(
      inputConfig ?? defaultConfig(nextPort(_.keys(usedPorts))),
      undefined,
      2,
    ),
  );

  const [portAlreadyInUse, setPortAlreadyInUse] = useState(false);

  const valueChanged = useCallback(
    (value: string, prettify?: boolean) => {
      let isValid: boolean;
      let parsedConfig: BridgeConfig | undefined;
      try {
        parsedConfig = JSON.parse(value) as BridgeConfig;
        setConfigValue(
          prettify ? JSON.stringify(parsedConfig, null, 2) : value,
        );
        isValid = ajv.validate(bridgeConfigSchema, parsedConfig);

        if (
          usedPorts[parsedConfig.port] != null &&
          usedPorts[parsedConfig.port] != bridgeId
        ) {
          isValid = false;
          setPortAlreadyInUse(true);
        } else {
          setPortAlreadyInUse(false);
        }
      } catch (_: unknown) {
        parsedConfig = undefined;
        isValid = false;
      }
      onChange(parsedConfig, isValid);
    },
    [setConfigValue, onChange, bridgeId, usedPorts],
  );

  return (
    <>
      <Box position="relative">
        <ReactCodeMirror
          value={configValue}
          onChange={(value) => valueChanged(value)}
          extensions={[
            json(),
            linter(jsonParseLinter(), {
              delay: 100,
            }),
            linter(jsonSchemaLinter(), {
              delay: 100,
              needsRefresh: handleRefresh,
            }),
            jsonLanguage.data.of({
              autocomplete: jsonCompletion({ mode: "json4" }),
            }),
            hoverTooltip(jsonSchemaHover()),
            stateExtensions(bridgeConfigSchema),
          ]}
          theme={codeMirrorTheme}
          height="400px"
        />
        <Button
          sx={{
            position: "absolute",
            right: "0",
            bottom: "0",
          }}
          onClick={() => valueChanged(configValue, true)}
        >
          Prettify
        </Button>
      </Box>
      {portAlreadyInUse && (
        <Alert severity="error">Port is already in use</Alert>
      )}
    </>
  );
};

function useCodeTheme() {
  const theme = useTheme();
  if (theme.palette.mode === "dark") {
    return vscodeDark;
  } else {
    return vscodeLight;
  }
}

function nextPort(ports: (number | string)[]): number {
  const usedPorts = ports.map((it) => it.toString());
  let exists: boolean;
  let curr = 5540;
  do {
    exists = usedPorts.includes(curr.toString());
    if (exists) {
      curr++;
    }
  } while (exists);
  return curr;
}
