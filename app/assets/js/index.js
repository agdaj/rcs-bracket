// index.js

const colourObj = [
  {
    'name': 'Red',
    'hex': '#fd3232'
  },
  {
    'name': 'Blue',
    'hex': '#2985f5'
  },
  {
    'name': 'Yellow',
    'hex': '#febc0d'
  },
  {
    'name': 'Green',
    'hex': '#21b546'
  },
  {
    'name': 'Orange',
    'hex': '#f88632'
  },
  {
    'name': 'Cyan',
    'hex': '#26cae2'
  },
  {
    'name': 'Pink',
    'hex': '#fe9bb5'
  },
  {
    'name': 'Purple',
    'hex': '#9570fe'
  },
  {
    'name': 'CPU',
    'hex': '#acacac'
  },
  {
    'name': 'Amiibo',
    'hex': '#87ffcd'
  }
];

let playerObj = {};

// Initialize functions

const clearDetails = async () => {
  document.getElementById('tournamentName').value = '';
  document.getElementById('eventName').value = '';
  document.getElementById('round').value = '';

  document.getElementById('bestOf').selectedIndex = 0;
  document.getElementById('bestOfNum').value = 3;

  let lCheckDivs = document.getElementsByClassName('l-check');
  for (let i = 0; i < lCheckDivs.length; i++) {
    lCheckDivs[i].firstElementChild.checked = false;
    lCheckDivs[i].style.display = 'none';
  }
};

const adjustRoundDiv = async (round) => {
  if (round === 'Grand Finals') {
    let lCheckDivs = document.getElementsByClassName('l-check');
    for (let i = 0; i < lCheckDivs.length; i++) {
      lCheckDivs[i].style.display = 'block';
    }
  } else {
    let lCheckDivs = document.getElementsByClassName('l-check');
    for (let i = 0; i < lCheckDivs.length; i++) {
      lCheckDivs[i].firstElementChild.checked = false;
      lCheckDivs[i].style.display = 'none';
    }
  }
};

const clearPlayers = async () => {
  document.getElementById('player1Score').value = 0;
  document.getElementById('player2Score').value = 0;

  document.getElementById('player1LCheck').checked = false;
  document.getElementById('player2LCheck').checked = false;

  document.getElementById('player1Name').value = '';
  document.getElementById('player2Name').value = '';
};

const setPlayer1Colour = async (hex) => {
  const player1ColourBtn = document.getElementById('player1ColourBtn');
  player1ColourBtn.replaceChildren();

  let colourRect = document.createElement('div');
  colourRect.style.display = 'inline-flex';
  colourRect.style.width = '1em';
  colourRect.style.height = '1em';
  colourRect.style.backgroundColor = hex;

  player1ColourBtn.appendChild(colourRect);

  document.getElementById('player1Colour').value = hex;
};

const setPlayer2Colour = async (hex) => {
  const player2ColourBtn = document.getElementById('player2ColourBtn');
  player2ColourBtn.replaceChildren();

  let colourRect = document.createElement('div');
  colourRect.style.display = 'inline-flex';
  colourRect.style.width = '1em';
  colourRect.style.height = '1em';
  colourRect.style.backgroundColor = hex;

  player2ColourBtn.appendChild(colourRect);

  document.getElementById('player2Colour').value = hex;
};

const loadPlayer1ColourSet = async () => {
  const player1ColourList = document.getElementById('player1ColourList');
  player1ColourList.replaceChildren();

  for (let i = 0; i < colourObj.length; i++) {
    let p1ColourItem = document.createElement('li');

    let p1ColourBtn = document.createElement('btn');
    p1ColourBtn.setAttribute('class', 'dropdown-item');
    p1ColourBtn.setAttribute('type', 'button');
    p1ColourBtn.setAttribute('data-hex', colourObj[i].hex);
    p1ColourBtn.addEventListener('click', (event) => { setPlayer1Colour(event.target.closest('.dropdown-item').getAttribute('data-hex')) });
    p1ColourBtn.style.display = 'inline-flex';

    let colourRect = document.createElement('div');
    colourRect.style.width = '1em';
    colourRect.style.height = '1em';
    colourRect.style.margin = '5px';
    colourRect.style.backgroundColor = colourObj[i].hex;

    let colourName = document.createElement('div');
    colourName.innerHTML = colourObj[i].name;

    p1ColourBtn.appendChild(colourRect);
    p1ColourBtn.appendChild(colourName);

    p1ColourItem.appendChild(p1ColourBtn);

    player1ColourList.appendChild(p1ColourItem);
  }

  const defaultColour = colourObj[0];
  setPlayer1Colour(defaultColour.hex);
};

const loadPlayer2ColourSet = async () => {
  const player2ColourList = document.getElementById('player2ColourList');
  player2ColourList.replaceChildren();

  for (let i = 0; i < colourObj.length; i++) {
    let p2ColourItem = document.createElement('li');

    let p2ColourBtn = document.createElement('btn');
    p2ColourBtn.setAttribute('class', 'dropdown-item');
    p2ColourBtn.setAttribute('type', 'button');
    p2ColourBtn.setAttribute('data-hex', colourObj[i].hex);
    p2ColourBtn.addEventListener('click', (event) => { setPlayer2Colour(event.target.closest('.dropdown-item').getAttribute('data-hex')) });
    p2ColourBtn.style.display = 'inline-flex';

    let colourRect = document.createElement('div');
    colourRect.style.width = '1em';
    colourRect.style.height = '1em';
    colourRect.style.margin = '5px';
    colourRect.style.backgroundColor = colourObj[i].hex;

    let colourName = document.createElement('div');
    colourName.innerHTML = colourObj[i].name;

    p2ColourBtn.appendChild(colourRect);
    p2ColourBtn.appendChild(colourName);

    p2ColourItem.appendChild(p2ColourBtn);

    player2ColourList.appendChild(p2ColourItem);
  }

  const defaultColour = colourObj[1];
  setPlayer2Colour(defaultColour.hex);
};

const loadCharacterList = async () => {
  const player1CharSS = document.getElementById('player1CharSS');
  const player2CharSS = document.getElementById('player2CharSS');
  player1CharSS.replaceChildren();
  player2CharSS.replaceChildren();

  const characterList = await window.fsAPI.fetch.characterList();
  for (let i = 0; i < characterList.length; i++) {
    const characterSelectScreen = await window.fsAPI.fetch.characterSelectScreen(characterList[i]);

    let p1CharSSDiv = document.createElement('div');
    p1CharSSDiv.setAttribute('class', 'modal-char-select');

    let p1CharSSImg = document.createElement('img');
    p1CharSSImg.setAttribute('data-bs-dismiss', 'modal');
    p1CharSSImg.setAttribute('src', `data:image/png;base64,${characterSelectScreen}`);
    p1CharSSImg.setAttribute('alt', characterList[i]);
    p1CharSSImg.addEventListener('click', (event) => { loadPlayer1Character(event.target.getAttribute('alt')) });

    p1CharSSDiv.appendChild(p1CharSSImg);

    let p2CharSSDiv = document.createElement('div');
    p2CharSSDiv.setAttribute('class', 'modal-char-select');

    let p2CharSSImg = document.createElement('img');
    p2CharSSImg.setAttribute('data-bs-dismiss', 'modal');
    p2CharSSImg.setAttribute('src', `data:image/png;base64,${characterSelectScreen}`);
    p2CharSSImg.setAttribute('alt', characterList[i]);
    p2CharSSImg.addEventListener('click', (event) => { loadPlayer2Character(event.target.getAttribute('alt')) });

    p2CharSSDiv.appendChild(p2CharSSImg);

    player1CharSS.appendChild(p1CharSSDiv);
    player2CharSS.appendChild(p2CharSSDiv);
  }

  loadPlayer1Character(characterList[characterList.length - 1]);
  loadPlayer2Character(characterList[characterList.length - 1]);
};

const loadPlayer1Character = async (character, skin = '') => {
  characterSelectScreen = await window.fsAPI.fetch.characterSelectScreen(character);
  document.getElementById('player1Char').value = character;
  document.getElementById('player1CharSSImg').src = `data:image/png;base64,${characterSelectScreen}`;
  loadPlayer1CharacterIcons(character, skin);
};

const loadPlayer2Character = async (character, skin = '') => {
  characterSelectScreen = await window.fsAPI.fetch.characterSelectScreen(character);
  document.getElementById('player2Char').value = character;
  document.getElementById('player2CharSSImg').src = `data:image/png;base64,${characterSelectScreen}`;
  loadPlayer2CharacterIcons(character, skin);
};

const loadPlayer1CharacterIcons = async (character, skin = '') => {
  const skinDiv = document.getElementById('player1SkinDiv');
  skinDiv.replaceChildren();

  const characterIcons = await window.fsAPI.fetch.characterIcons(character);
  for (let i = 0; i < characterIcons.length; i++) {
    let p1Input = document.createElement('input');
    p1Input.setAttribute('class', 'btn-check btn-player-1-skin');
    p1Input.setAttribute('type', 'radio');
    p1Input.setAttribute('name', 'player1Skin');
    p1Input.setAttribute('id', `player1Skin${i}`);
    p1Input.setAttribute('value', characterIcons[i].name);
    p1Input.setAttribute('autocomplete', 'off');
    if (skin === characterIcons[i].name || i === 0) {
      p1Input.setAttribute('checked', '');
    }

    let p1Label = document.createElement('label');
    p1Label.setAttribute('class', 'btn btn-outline-danger btn-skin');
    p1Label.setAttribute('for', 'player1Skin' + i);

    let p1Icon = document.createElement('img');
    p1Icon.setAttribute('src', `data:image/png;base64,${characterIcons[i].base64}`);
    p1Icon.setAttribute('alt', i);

    p1Label.appendChild(p1Icon);

    skinDiv.appendChild(p1Input);
    skinDiv.appendChild(p1Label);
  };

  if (skin === '' && characterIcons.length) {
    skin = document.querySelector('input[name="player1Skin"]:checked').value;
  }
  loadPlayer1CharacterRender(character, skin);
  let player1SkinBtns = document.getElementsByClassName('btn-player-1-skin');
  for (let i = 0; i < player1SkinBtns.length; i++) {
    player1SkinBtns[i].addEventListener('click', (event) => {
      loadPlayer1CharacterRender(document.getElementById('player1Char').value, event.target.value);
    });
  }
};

const loadPlayer2CharacterIcons = async (character, skin = '') => {
  const skinDiv = document.getElementById('player2SkinDiv');
  skinDiv.replaceChildren();

  const characterIcons = await window.fsAPI.fetch.characterIcons(character);
  for (let i = 0; i < characterIcons.length; i++) {
    let p2Input = document.createElement('input');
    p2Input.setAttribute('class', 'btn-check btn-player-2-skin');
    p2Input.setAttribute('type', 'radio');
    p2Input.setAttribute('name', 'player2Skin');
    p2Input.setAttribute('id', `player2Skin${i}`);
    p2Input.setAttribute('value', characterIcons[i].name);
    p2Input.setAttribute('autocomplete', 'off');
    if (skin === characterIcons[i].name || i === 0) {
      p2Input.setAttribute('checked', '');
    }

    let p2Label = document.createElement('label');
    p2Label.setAttribute('class', 'btn btn-outline-danger btn-skin');
    p2Label.setAttribute('for', 'player2Skin' + i);

    let p2Icon = document.createElement('img');
    p2Icon.setAttribute('src', `data:image/png;base64,${characterIcons[i].base64}`);
    p2Icon.setAttribute('alt', i);

    p2Label.appendChild(p2Icon);

    skinDiv.appendChild(p2Input);
    skinDiv.appendChild(p2Label);
  };

  if (skin === '' && characterIcons.length) {
    skin = document.querySelector('input[name="player2Skin"]:checked').value;
  }
  loadPlayer2CharacterRender(character, skin);
  let player2SkinBtns = document.getElementsByClassName('btn-player-2-skin');
  for (let i = 0; i < player2SkinBtns.length; i++) {
    player2SkinBtns[i].addEventListener('click', (event) => {
      loadPlayer2CharacterRender(document.getElementById('player2Char').value, event.target.value);
    });
  }
};

const loadPlayer1CharacterRender = async (character, skin) => {
  const characterRender = await window.fsAPI.fetch.characterRender(character, skin);
  document.getElementById('player1SkinRenderImg').setAttribute('src', `data:image/png;base64,${characterRender}`);
};

const loadPlayer2CharacterRender = async (character, skin) => {
  const characterRender = await window.fsAPI.fetch.characterRender(character, skin);
  document.getElementById('player2SkinRenderImg').setAttribute('src', `data:image/png;base64,${characterRender}`);
};

const loadPlayerObj = async () => {
  playerObj = await window.fsAPI.fetch.playerObj();

  const playerListDatalist = document.getElementById('playerList');
  playerListDatalist.replaceChildren();

  for (let player in playerObj) {
    let playerListOption = document.createElement('option');
    playerListOption.setAttribute('value', player);
    playerListDatalist.appendChild(playerListOption)
  }
};

const incrementP1Score = async () => {
  document.getElementById('player1Score').value = parseInt(document.getElementById('player1Score').value) + 1;
};

const incrementP2Score = async () => {
  document.getElementById('player2Score').value = parseInt(document.getElementById('player2Score').value) + 1;
};

const resetScores = async () => {
  document.getElementById('player1Score').value = 0;
  document.getElementById('player2Score').value = 0;
}

const swapPlayers = async () => {
  const player1Score = document.getElementById('player1Score').value;
  const player2Score = document.getElementById('player2Score').value;

  const player1LCheck = document.getElementById('player1LCheck').checked;
  const player2LCheck = document.getElementById('player2LCheck').checked;

  const player1Char = document.getElementById('player1Char').value;
  const player2Char = document.getElementById('player2Char').value;

  const player1CharSSImg = document.getElementById('player1CharSSImg').src;
  const player2CharSSImg = document.getElementById('player2CharSSImg').src;

  const player1Name = document.getElementById('player1Name').value;
  const player2Name = document.getElementById('player2Name').value;

  const player1Skin = document.querySelector('input[name="player1Skin"]:checked') ? document.querySelector('input[name="player1Skin"]:checked').value : '';
  const player2Skin = document.querySelector('input[name="player2Skin"]:checked') ? document.querySelector('input[name="player2Skin"]:checked').value : '';

  document.getElementById('player1Score').value = player2Score;
  document.getElementById('player2Score').value = player1Score;

  document.getElementById('player1LCheck').checked = player2LCheck;
  document.getElementById('player2LCheck').checked = player1LCheck;

  document.getElementById('player1Char').value = player2Char;
  document.getElementById('player2Char').value = player1Char;

  document.getElementById('player1CharSSImg').src = player2CharSSImg;
  document.getElementById('player2CharSSImg').src = player1CharSSImg;

  document.getElementById('player1Name').value = player2Name;
  document.getElementById('player2Name').value = player1Name;

  loadPlayer1CharacterIcons(player2Char, player2Skin);
  loadPlayer2CharacterIcons(player1Char, player1Skin);
};

const clearCommentators = async () => {
  document.getElementById('commentator1Name').value = '';
  document.getElementById('commentator2Name').value = '';
};

const swapCommentators = async () => {
  const commentator1Name = document.getElementById('commentator1Name').value;
  const commentator2Name = document.getElementById('commentator2Name').value;

  document.getElementById('commentator1Name').value = commentator2Name;
  document.getElementById('commentator2Name').value = commentator1Name;
};

const updatePlayerObj = async (infoObj) => {
  let player1Name = infoObj['player1Name'];
  let player1Char = infoObj['player1Char'];
  let player1Skin = infoObj['player1Skin'];

  if (player1Name.trim() !== '') {
    playerObj[player1Name] = { char: player1Char, skin: player1Skin };
  }

  let player2Name = infoObj['player2Name'];
  let player2Char = infoObj['player2Char'];
  let player2Skin = infoObj['player2Skin'];

  if (player2Name.trim() !== '') {
    playerObj[player2Name] = { char: player2Char, skin: player2Skin };
  }

  const playerListDatalist = document.getElementById('playerList');
  playerListDatalist.replaceChildren();

  for (let player in playerObj) {
    let playerListOption = document.createElement('option');
    playerListOption.setAttribute('value', player);
    playerListDatalist.appendChild(playerListOption)
  }

  window.fsAPI.save.playerObj(playerObj);
}

const saveInfoObj = async (infoObj) => {
  let success = await window.fsAPI.save.infoObj(infoObj);
  if (success) {
    const toast = new bootstrap.Toast(document.getElementById('saveInfoSuccessToast'));
    toast.show();
  } else {
    const toast = new bootstrap.Toast(document.getElementById('saveInfoFailToast'));
    toast.show();
  }
}

// Call functions for initial rendering

loadPlayer1ColourSet();
loadPlayer2ColourSet();
loadCharacterList();
loadPlayerObj();

// Set listeners

document.getElementById('clearDetails').addEventListener('click', () => {
  clearDetails();
});

document.getElementById('round').addEventListener('change', (event) => {
  adjustRoundDiv(event.target.value);
});

document.getElementById('clearPlayers').addEventListener('click', () => {
  clearPlayers();
});

document.getElementById('player1Name').addEventListener('input', (event) => {
  if (event.target.value in playerObj) {
    loadPlayer1Character(playerObj[event.target.value].char, playerObj[event.target.value].skin);
  }
});

document.getElementById('player2Name').addEventListener('input', (event) => {
  if (event.target.value in playerObj) {
    loadPlayer2Character(playerObj[event.target.value].char, playerObj[event.target.value].skin);
  }
});

document.getElementById('resetScores').addEventListener('click', (event) => {
  resetScores();
});

document.getElementById('swapPlayers').addEventListener('click', () => {
  swapPlayers();
});

document.getElementById('clearCommentators').addEventListener('click', () => {
  clearCommentators();
});

document.getElementById('swapCommentators').addEventListener('click', () => {
  swapCommentators();
});

document.getElementById('bracketForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const serializedInfo = Object.fromEntries(formData.entries());
  serializedInfo['bestOf'] = serializedInfo['bestOf'] + ' ' + serializedInfo['bestOfNum'];
  serializedInfo['player1LCheck'] = !(formData.get('player1LCheck') === null);
  serializedInfo['player2LCheck'] = !(formData.get('player2LCheck') === null);

  updatePlayerObj(serializedInfo);
  saveInfoObj(serializedInfo);
});

// Set mouse bindings

Mousetrap.bind(['1'], () => { incrementP1Score() });
Mousetrap.bind(['2'], () => { incrementP2Score() });
Mousetrap.bind(['esc'], () => { resetScores() });
Mousetrap.bind(['mod+1'], () => { document.getElementById('detailsCard').scrollIntoView() });
Mousetrap.bind(['mod+2'], () => { document.getElementById('playerCard').scrollIntoView() });
Mousetrap.bind(['mod+3'], () => { document.getElementById('commentatorCard').scrollIntoView() });
Mousetrap.bind(['enter'], () => { if (document.activeElement.tagName === 'BODY') document.getElementById('submitForm').click(); });
