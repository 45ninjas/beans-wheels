# wheels.lua
This script is quickly cobbled together by a beamng lua noob. I have no idea what I'm doing.

This script changes the hubs and wheels, takes a screenshot and writes a json file of each hub and wheel combination.

Most most of the information can be derived from the description.

## Requirements
- The [Single Wheel](https://www.beamng.com/resources/single-wheel.20140/) mod.
- This script

## How to use it
- Place this script in your beamng profile in the scripts directory *(`%AppData%/Local/BeamNG.drive/0.31/scripts/wheels.lua`)*.
- Spawn the [Single Wheel](https://www.beamng.com/resources/single-wheel.20140/) vehicle.
- Set the simulation speed to something very low.
- Set gravity to zero.
- Open editor `F11` and move the player's vehicle up to a position that will allow the largest wheels to not clip through ground.
- Use freecam to position your camera, set the time and FOV. Then use `extensions.wheels.saveCamera()` to save your camera position to the `camera.json` file.
- Once you've setup your scene run `extensions.wheels.setup()` to setup the script for running.
- Hide your hud, set your graphics settings and resolution.
- respawn your vehicle or run `extensions.wheels.continue()`

## Paths and files.
Every file this script generates lives in the `wheels` directory inside your beamng user profile. Example: `%AppData%/Local/BeamNG.drive/0.31/wheels`

### Example wheel file
`steelwheel_03a_17x9_F.json`
```json
{
    "name": "steelwheel_03a_17x9_F",
    "authors": "BeamNG",
    "description": "17x9 STX Off-Road Steel Front Wheels (White)",
    "slot": "wheel_F_8"
}
```