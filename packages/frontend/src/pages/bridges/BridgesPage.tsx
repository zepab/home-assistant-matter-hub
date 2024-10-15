import {
  useBridges,
  useCreateBridge,
  useDeleteBridge,
} from "../../hooks/data/bridges";
import { BridgeList } from "../../components/bridge/BridgeList";
import { Backdrop, CircularProgress, IconButton, Stack } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { BridgeData } from "@home-assistant-matter-hub/common";
import { BridgeDetails } from "../../components/bridge/BridgeDetails.tsx";
import { Add } from "@mui/icons-material";
import { useDialogs, useNotifications } from "@toolpad/core";
import { EditBridgeConfig } from "./EditBridgeConfig.tsx";
import { useNavigate, useParams } from "react-router-dom";
import _ from "lodash";

export const BridgesPage = () => {
  const notifications = useNotifications();
  const dialogs = useDialogs();
  const navigate = useNavigate();

  const { bridgeId } = useParams();

  const [seed, setSeed] = useState(() => Date.now());

  const createBridge = useCreateBridge();
  const deleteBridge = useDeleteBridge();
  const [bridges, isLoading, bridgeError] = useBridges(seed);

  const selectedBridge = useMemo(
    () => bridges?.find((b) => b.id === bridgeId),
    [bridgeId, bridges],
  );

  useEffect(() => {
    if (bridgeId && bridges && !bridges.some((b) => b.id === bridgeId)) {
      navigate("./");
    }
  }, [bridgeId, bridges, navigate]);

  const setSelectedBridge = (bridge: BridgeData) => {
    navigate(`./${bridge.id}`);
  };

  const onDeleteBridge = async (bridge: BridgeData) => {
    await deleteBridge(bridge.id);
    setSeed(Date.now());
  };

  useEffect(() => {
    if (bridgeError) {
      notifications.show(bridgeError.message, { severity: "error" });
    }
  }, [bridgeError, notifications]);

  const createBridgeAction = async () => {
    const result = await dialogs.open(EditBridgeConfig, {
      usedPorts: _.fromPairs(bridges?.map((b) => [b.port, b.id]) ?? []),
    });
    if (!result) return;
    const [bridge, error] = await createBridge(result);
    if (bridge) {
      setSeed(Date.now());
    } else {
      notifications.show(error.message, { severity: "error" });
    }
  };

  return (
    <>
      <Backdrop
        sx={(theme) => ({ zIndex: theme.zIndex.drawer + 1 })}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Stack spacing={4}>
        {bridges && (
          <Box>
            <Box display="flex" justifyContent="end">
              <IconButton onClick={() => createBridgeAction()}>
                <Add />
              </IconButton>
            </Box>

            <BridgeList
              bridges={bridges}
              onSelect={setSelectedBridge}
              selectedId={selectedBridge?.id}
              onDelete={onDeleteBridge}
            />
          </Box>
        )}

        {selectedBridge && <BridgeDetails bridge={selectedBridge} />}
      </Stack>
    </>
  );
};
