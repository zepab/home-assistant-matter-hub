import { BridgeConfig } from "@home-assistant-matter-hub/common";
import { DialogProps } from "@toolpad/core";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { BridgeConfigEditor } from "../../components/bridge/BridgeConfigEditor.tsx";
import { useState } from "react";
import Box from "@mui/material/Box";

export type CreateUpdateBridgeProps = DialogProps<
  EditBridgeConfigProps,
  BridgeConfig | undefined
>;

export interface EditBridgeConfigProps {
  bridgeId?: string;
  bridgeConfig?: BridgeConfig | undefined;
  usedPorts: Record<number, string>;
}

export const EditBridgeConfig = (props: CreateUpdateBridgeProps) => {
  const [config, setConfig] = useState<BridgeConfig | undefined>(
    props.payload.bridgeConfig,
  );
  const [isValid, setIsValid] = useState(false);

  const onChange = (config: BridgeConfig | undefined, isValid: boolean) => {
    setConfig(config);
    setIsValid(isValid);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={props.open}
      onClose={() => props.onClose(undefined)}
    >
      <DialogTitle>
        {props.payload.bridgeConfig
          ? `Update ${props.payload.bridgeConfig.name}`
          : "Create a new Bridge"}
      </DialogTitle>
      <DialogContent>
        <BridgeConfigEditor
          config={config}
          bridgeId={props.payload.bridgeId}
          usedPorts={props.payload.usedPorts}
          onChange={onChange}
        />
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={() => props.onClose(undefined)}>
          Cancel
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button disabled={!isValid} onClick={() => props.onClose(config)}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
