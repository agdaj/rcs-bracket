# rcs-bracket
Royal City Smash SSBU Bracket Manager in Electron. A pet project by Jireh Agda (jirehagda@gmail.com), based on [Ultimate Stream Tool](https://github.com/pokerobybeto/Ultimate-Stream-Tool) by pokerobybeto.

## Features
- Accepts standard bracket overlay components as inputs
- Allows tracking of players, characters, and score, including double elimination [L] state (set Round as **Grand Finals**)
- Searches character assets in folder to display character renders, stock icons, and selection screen images (see [Character Assets](#character-assets))
- Supports 2-person commentator input
- Generates output JSON to transcribe set state (`info.json`)

## Character Assets
```
characters
|-- character-list.json
|-- character-select-screen
|   |-- CHARACTER_1.png
|   `-- CHARACTER_2.png
|-- renders
|   |-- CHARACTER_1
|   |   |-- CHARACTER_1 (1).png
|   |   `-- CHARACTER_1 (2).png
|   `-- CHARACTER_2.png
`-- stock-icons
    |-- CHARACTER_1
    |   |-- CHARACTER_1 (1).png
    |   `-- CHARACTER_1 (2).png
    `-- CHARACTER_2.png
```
To allow the manager to use character assets correctly, the folder contents must have:
- `character-list.json`
  - This is a file with a list of characters and is the main reference when it comes to spelling.
- `character-select-screen/`
  - This is a folder where characters images as they appear in a character select screen are put in. The name of the file (without the extension) must match the spelling in `character-list.json` for it to be found.
- `renders/`
  - This is a folder where characters splash art are put in. If characters have multiple skins, they can be placed under a subfolder that must match the spelling in `character-list.json`. Otherwise, if there is a single skin, a single image whose name matches the spelling in `character-list.json` (without the extension) can be added.
- `stock-icons/`
  - This is a folder where characters stock icons are put in. These images will be used to symbolize a character's different skins and should line up with the how a character's assets are like within `renders/`.

During app initialization, the app will ask where character assets in this structure are found. This path will be modifiable in the future as a setting that can be updated. There are no restrictions to what assets are placed within this folder, but the interface is tailored towards Super Smash Bros. Ultimate. The initial character that is loaded is the last character on the list.
