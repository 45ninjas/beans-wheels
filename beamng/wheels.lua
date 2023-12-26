local lunajson = require('libs/lunajson/lunajson')
local jbeam_io = require('jbeam/io')

local M = {}

local routine
local veh, veh_data, all_slots, all_parts

local function optionalCaptureConfig(cfg, path, json_data)
  local root = "wheels/pics/"
  if not fileExistsOrNil(root .. path .. ".png") then
    log(root .. path)
    extensions.core_vehicle_partmgmt.setPartsConfig(cfg, true)
    coroutine.yield()
    createScreenshot(root .. path, "PNG", 1, 1, 0, false)
    extensions.core_vehicle_partmgmt.resetPartsToLoadedConfig()
  end

  local file = io.open(root .. path .. ".json", "w")
  file.write(file, lunajson.encode(json_data, true))
end

local function nextConfig()
  local parts = extensions.core_vehicle_partmgmt.getConfig()["parts"]
  for _, hub in pairs(all_slots["wheel_hub"]) do
    for _, wheel_type in pairs(all_parts[hub]["slotInfoUi"]) do
      for _, wheel_slot in pairs(wheel_type["allowTypes"]) do
        for _, wheel in pairs(all_slots[wheel_slot]) do
          -- Set the vehicle parts.
          parts = {}
          parts["wheel_hub"] = hub
          parts[wheel_slot] = wheel

          -- Set the data to be saved into the wheel file.
          local data = {}
          data["name"] = wheel
          data["description"] = all_parts[wheel]["description"]
          data["authors"] = all_parts[wheel]["authors"]
          data["slot"] = wheel_slot
          data["slot_description"] = all_parts["description"]

          optionalCaptureConfig(parts, hub .. "/" .. wheel, data)
        end
      end
    end
  end
end
local function setup()
  veh = be:getPlayerVehicle(0)
  if veh:getJBeamFilename() ~= "Single_wheel" then
    warn("Vehicle must be 'Single Wheel' (it's a mod)")
    return
  end

  M.loadCamera()

  veh_data = extensions.core_vehicle_manager.getPlayerVehicleData()
  all_slots = jbeam_io.getAvailableSlotMap(veh_data.ioCtx)
  all_parts = jbeam_io.getAvailableParts(veh_data.ioCtx)

  -- Save all the parts and slots to a json file for the post processor.
  local data = {}
  data["slots"] = all_slots
  data["parts"] = all_parts
  local file;
  file = io.open("wheels/all-data.json", "w")
  file.write(file, lunajson.encode(data, true))

  routine = coroutine.create(nextConfig)
end

local function pause()
  coroutine.yield()
end

local function continue()
  coroutine.resume(routine)
end

local function onVehicleResetted(vid)
  log("Vehicle Spawned: " .. vid)
  if coroutine.status(routine) ~= "dead" then
    coroutine.resume(routine)
  end
end

local function saveCamera()
  -- Write camera settings to a json file.
  local data = {}
  local x, y, z = core_camera.getPositionXYZ();
  data["position"] = {}
  data["position"]["x"] = x
  data["position"]["y"] = y
  data["position"]["z"] = z
  local x, y, z, w = core_camera.getQuatXYZW()
  data["rotation"] = {}
  data["rotation"]["x"] = x
  data["rotation"]["y"] = y
  data["rotation"]["z"] = z
  data["rotation"]["w"] = w
  data["fov"] = core_camera.getFovDeg()
  data["time"] = getTimeOfDay()
  local file = io.open("wheels/camera.json", "w")
  file.write(file, lunajson.encode(data, true))
end

local function loadCamera()
  local file = io.open("wheels/camera.json", "r")
  local data = lunajson.decode(file.read(file, "a"))
  core_camera.setPosRot(0, data["position"]["x"], data["position"]["y"], data["position"]["z"],
    data["rotation"]["x"], data["rotation"]["y"], data["rotation"]["z"], data["rotation"]["w"])
  core_camera.setFOV(0, data["fov"])
  setTimeOfDay(data["time"])
end

M.setup = setup
M.pause = pause
M.continue = continue
M.onVehicleResetted = onVehicleResetted
M.saveCamera = saveCamera
M.loadCamera = loadCamera


return M

-- Write stuff to a json file.
-- local data = {}
-- data["slots"] = all_slots
-- data["parts"] = all_parts
-- local file;
-- file = io.open("wheels/all-data.json", "w")
-- file.write(file, lunajson.encode(data, true))
