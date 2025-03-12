import { DevicesProvider, WithEditor } from "@grapesjs/react";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { cx } from "./common";
import TopbarButtons from "./TopbarButtons";
import { ProjectData } from "grapesjs";
type TopbarProps = {
  onSave: (projectData: ProjectData) => void;
  className?: string;
};

export default function Topbar({ className, onSave }: TopbarProps) {
  return (
    <div className={cx("gjs-top-sidebar flex items-center p-1", className)}>
      <DevicesProvider>
        {({ selected, select, devices }) => (
          <FormControl size="small">
            <Select value={selected} onChange={(ev) => select(ev.target.value)}>
              {devices.map((device) => (
                <MenuItem value={device.id} key={device.id}>
                  {device.getName()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DevicesProvider>
      <WithEditor>
        <button
          className="bg-red-700 text-white px-3 py-1 rounded-md ml-2"
          onClick={onSave}
        >
          Save
        </button>
        <TopbarButtons className="ml-auto px-2" />
      </WithEditor>
    </div>
  );
}
