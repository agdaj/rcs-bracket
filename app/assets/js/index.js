// index.js

const perPage = 10;
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

let characterList = [];

let setIdObj = {};
let playerObj = {};

// start.gg Interfacing

const queryTournamentCountAsAdmin = async (apiToken) => {
  const query = `
    query UserTournamentsAsAdmin {
      currentUser {
        tournaments(query: {
          filter: {
            tournamentView: "admin"
          }
        }) {
          pageInfo {
            total
          }
        }
      }
    }
  `;
  const variables = {};
  const data = {'query': query, 'variables': variables};

  return fetch('https://api.start.gg/gql/alpha', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify(data),
  });
};

const queryTournamentsAsAdmin = async (page, perPage, apiToken) => {
  const query = `
    query UserTournamentsAsAdmin($page: Int!, $perPage: Int!) {
      currentUser {
        tournaments(query: {
          page: $page
          perPage: $perPage
          filter: {
            tournamentView: "admin"
          }
        }) {
          nodes {
            id
            name
          }
        }
      }
    }
  `;
  const variables = {'page': page, 'perPage': perPage};
  const data = {'query': query, 'variables': variables};

  return fetch('https://api.start.gg/gql/alpha', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify(data),
  });
};

const queryEvents = async (tournamentId, apiToken) => {
  const query = `
    query TournamentQuery($tournamentId: ID!) {
      tournament(id: $tournamentId) {
        events {
          id
          name
        }
      }
    }
  `;
  const variables = {'tournamentId': tournamentId};
  const data = {'query': query, 'variables': variables};

  return fetch('https://api.start.gg/gql/alpha', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify(data),
  });
};

const querySetCount = async (eventId, apiToken) => {
  const query = `
    query EventSets($eventId: ID!) {
      event(id: $eventId) {
        name
        sets {
          pageInfo {
            total
          }
        }
      }
    }
  `;
  const variables = {'eventId': eventId};
  const data = {'query': query, 'variables': variables};

  return fetch('https://api.start.gg/gql/alpha', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify(data),
  });
};

const querySets = async (eventId, page, perPage, apiToken) => {
  const query = `
    query EventSets($eventId: ID!, $page: Int!, $perPage: Int!) {
      event(id: $eventId) {
        sets(
          page: $page
          perPage: $perPage
          sortType: MAGIC
        ) {
          nodes {
            id
            fullRoundText
            phaseGroup {
                displayIdentifier
                phase {
                    name
                }
            }
            identifier
            slots {
              entrant {
                name
                participants {
                  prefix
                  gamerTag
                }
              }
              standing {
                placement
                stats {
                  score {
                    value
                  }
                }
              }
            }
            completedAt
          }
        }
      }
    }
  `;
  const variables = {'eventId': eventId, 'page': page, 'perPage': perPage};
  const data = {'query': query, 'variables': variables};

  return fetch('https://api.start.gg/gql/alpha', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify(data),
  });
};

const createMatch = (matchNode) => {
  let match = document.createElement('div');
  match.classList.add('match', 'has-identifier', 'reportable');
  if (matchNode.completedAt === null) {
    match.classList.add('playable');
  }
  match.setAttribute('data-set-id', matchNode.id);

  let matchAffixWrapper = document.createElement('div');
  matchAffixWrapper.classList.add('match-affix-wrapper');

  let matchSectionTop = document.createElement('div');
  matchSectionTop.classList.add('match-section', 'match-section-top');
  matchSectionTop.appendChild(createMatchSectionWrapper(matchNode.slots[0]));

  let matchSpacer = document.createElement('div');
  matchSpacer.classList.add('match-spacer');

  let matchSectionBottom = document.createElement('div');
  matchSectionBottom.classList.add('match-section', 'match-section-bottom');
  matchSectionBottom.appendChild(createMatchSectionWrapper(matchNode.slots[1]));

  matchAffixWrapper.append(
    matchSectionTop,
    matchSpacer,
    matchSectionBottom,
    createIdentifierLabel(matchNode.identifier)
  );
  match.appendChild(matchAffixWrapper);
  return match;
};

const createMatchSectionWrapper = (slot) => {
  let matchPlayerName = document.createElement('div');
  matchPlayerName.classList.add('matchSectionWrapper');

  let matchPlayer = document.createElement('div');
  matchPlayer.classList.add('match-player', 'entrant');

  matchPlayer.appendChild(createMatchPlayerName(slot.entrant));
  if (slot.standing !== null) {
    matchPlayer.appendChild(createMatchPlayerInfo(slot.standing));

    if (slot.standing.stats.score.value !== null) {
      if (slot.standing.placement === 1) {
        matchPlayer.classList.add('winner');
      } else {
        matchPlayer.classList.add('loser');
      }
    }
  }
  return matchPlayer;
}

const createMatchPlayerName = (entrant) => {
  let matchPlayerName = document.createElement('div');
  matchPlayerName.classList.add('match-player-name');

  let flexItemGrower = document.createElement('div');
  flexItemGrower.classList.add('flex-item-grower', 'text-ellipsis');

  let nameSpan = document.createElement('span');
  let nameContainerSpan = document.createElement('span');
  nameContainerSpan.classList.add('match-player-name-container');
  nameSpan.appendChild(nameContainerSpan);

  if (entrant.participants.length > 1) {
    let nameNode = document.createTextNode(entrant.name);
    nameContainerSpan.appendChild(nameNode);
  } else {
    if (entrant.participants[0].prefix !== null && entrant.participants[0].prefix !== '') {
      let prefixSpan = document.createElement('span');
      prefixSpan.classList.add('prefix', 'text-muted');
      prefixSpan.innerText = entrant.participants[0].prefix + ' ';

      nameContainerSpan.appendChild(prefixSpan);
    }

    let nameNode = document.createTextNode(entrant.participants[0].gamerTag);
    nameContainerSpan.appendChild(nameNode);
  }

  flexItemGrower.appendChild(nameSpan);
  matchPlayerName.appendChild(flexItemGrower);
  return matchPlayerName;
};

const createMatchPlayerInfo = (standing) => {
  let matchPlayerInfo = document.createElement('div');
  matchPlayerInfo.classList.add('match-player-info');

  if (standing.stats.score.value === -1) {
    matchPlayerInfo.classList.add('status-bar');

    let textDQ = document.createElement('div');
    textDQ.classList.add('text-dq');
    textDQ.innerText = 'DQ';

    matchPlayerInfo.appendChild(textDQ);
  } else if (standing.stats.score.value === 0 && standing.placement === 1) {
    matchPlayerInfo.classList.add('status-bar');

    let checkSVG = document.createElement('img');
    checkSVG.setAttribute('src', 'assets/images/svg/check.svg');
    checkSVG.classList.add('text-success');

    matchPlayerInfo.appendChild(checkSVG);
  } else if (standing.stats.score.value !== null) {
    let matchPlayerStocks = document.createElement('div');
    matchPlayerStocks.classList.add('match-player-stocks');
    matchPlayerStocks.innerText = standing.stats.score.value;

    matchPlayerInfo.appendChild(matchPlayerStocks);
  }
  return matchPlayerInfo;
};

const createIdentifierLabel = (identifier) => {
  let identifierLabel = document.createElement('span');
  identifierLabel.classList.add('label', 'label-default', 'match-label');

  let identifierContainer = document.createElement('span');
  identifierContainer.classList.add('identifier-container');
  identifierContainer.innerText = identifier;

  let caretRightSVG = document.createElement('img');
  caretRightSVG.setAttribute('src', 'assets/images/svg/caret-right-fill.svg');
  caretRightSVG.classList.add('caret-right');

  identifierLabel.append(identifierContainer, caretRightSVG);
  return identifierLabel;
};

// Initialize functions

const loadSettings = async () => {
  let settingsObj = await window.fsAPI.fetch.settingsObj();

  let apiToken = settingsObj['api.token'];

  document.getElementById('apiToken').value = apiToken;
};

const populateTournaments = async (apiToken) => {
  document.getElementById('tournament').replaceChildren();
  document.getElementById('spinnerSGG').classList.remove('d-none');

  return queryTournamentCountAsAdmin(apiToken)
    .then(response => response.json())
    .then(response => {
      let tournamentQueries = [];

      let page = 1;
      let tournamentCount = 0;
      let tournamentTotal = response['data']['currentUser']['tournaments']['pageInfo']['total'];
      while (tournamentCount < tournamentTotal) {
        tournamentQueries.push(queryTournamentsAsAdmin(page, perPage, apiToken));

        page += 1;
        tournamentCount += perPage;
      }

      return Promise.all(tournamentQueries);
    })
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(responses => {
      let tournamentObj = {};
      responses.forEach(response => {
        response['data']['currentUser']['tournaments']['nodes'].forEach(node => {
          let tournamentId = node['id'];
          let tournamentName = node['name'];
          tournamentObj[tournamentId] = tournamentName;
        })
      });

      let defaultOption = new Option('Select Tournament');
      defaultOption.disabled = true;
      defaultOption.selected = true;
      document.getElementById('tournament').add(defaultOption, undefined);
      Object.entries(tournamentObj).reverse().forEach(([tournamentId, tournamentName]) => {
        let eventOption = new Option(tournamentName, tournamentId);
        document.getElementById('tournament').add(eventOption, undefined);
      });

      document.getElementById('spinnerSGG').classList.add('d-none');
    })
    .catch(err => {
      console.log(err);
      const toast = new bootstrap.Toast(document.getElementById('findTournamentsFailToast'));
      toast.show();

      document.getElementById('spinnerSGG').classList.add('d-none');
    })
};

const populateEvents = async (tournamentId, apiToken) => {
  document.getElementById('event').replaceChildren();
  document.getElementById('spinnerSGG').classList.remove('d-none');

  return queryEvents(tournamentId, apiToken)
    .then(response => response.json())
    .then(response => {
      let events = response['data']['tournament']['events'];
      let defaultOption = new Option('Select event');
      defaultOption.disabled = true;
      defaultOption.selected = true;
      document.getElementById('event').add(defaultOption, undefined);
      for (let i = 0; i < events.length; i++) {
        let eventOption = new Option(events[i].name, events[i].id);
        document.getElementById('event').add(eventOption, undefined);
      }

      document.getElementById('spinnerSGG').classList.add('d-none');
    })
    .catch(err => {
      console.log(err);
      const toast = new bootstrap.Toast(document.getElementById('findEventsFailToast'));
      toast.show();

      document.getElementById('spinnerSGG').classList.add('d-none');
    })
};

const populateSets = async (eventId, apiToken) => {
  setIdObj = {};
  document.getElementById('setPhases').replaceChildren();
  document.getElementById('setPhaseGroup').replaceChildren();
  document.getElementById('setSelector').classList.remove('d-none');
  document.getElementById('setNotice').classList.add('d-none');
  document.getElementById('spinnerSGG').classList.remove('d-none');

  return querySetCount(eventId, apiToken)
    .then(response => response.json())
    .then(response => {
      let setQueries = [];

      let page = 1;
      let setCount = 0;
      let setTotal = response['data']['event']['sets']['pageInfo']['total'];
      while (setCount < setTotal) {
        setQueries.push(querySets(eventId, page, perPage, apiToken));

        page += 1;
        setCount += perPage;
      }

      let name = response['data']['event']['name'];
      document.getElementById('eventName').value = name;

      return Promise.all(setQueries);
    })
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(responses => {
      let setObj = {};
      responses.forEach(response => {
        response['data']['event']['sets']['nodes'].forEach(node => {
          // Preprocess node
          node['phaseGroup']['displayIdentifier'] = 'Pool ' + node['phaseGroup']['displayIdentifier'];

          let phaseName = node['phaseGroup']['phase']['name'];
          let phaseGroupName = node['phaseGroup']['displayIdentifier'];
          let identifier = node['identifier'];
          phaseName in setObj || (setObj[phaseName] = {});
          phaseGroupName in setObj[phaseName] || (setObj[phaseName][phaseGroupName] = {});

          setObj[phaseName][phaseGroupName][identifier] = node;

          let setId = node['id'];
          setIdObj[setId] = node;
        })
      })

      let setCount = 0;
      let setActive = false;
      Object.entries(setObj).forEach(([phase, phaseGroups]) => {
        Object.entries(phaseGroups).sort((a, b) => a[0].localeCompare(b[0], 'en', { numeric: true })).forEach(([phaseGroup, sets]) => {
          let phaseText = phase + ' - ' + phaseGroup;
          let navId = 'phase-nav-' + setCount;
          let contentId = 'phase-content-' + setCount;

          let phaseNav = document.createElement("li");
          phaseNav.classList.add("nav-item");
          phaseNav.setAttribute('role', 'presentation');

          let phaseLink = document.createElement("a");
          phaseLink.classList.add('nav-link');
          phaseLink.setAttribute('id', navId);
          phaseLink.setAttribute('data-bs-toggle', 'pill');
          phaseLink.setAttribute('data-bs-target', '#' + contentId);
          phaseLink.setAttribute('type', 'button');
          phaseLink.setAttribute('role', 'tab');
          phaseLink.setAttribute('aria-controls', contentId);
          phaseLink.setAttribute('aria-selected', 'false');
          phaseLink.text = phaseText;
          if (!setActive) {
            phaseLink.classList.add('active');
            phaseLink.setAttribute('aria-selected', 'true');
          }
          phaseNav.appendChild(phaseLink);

          let phaseContent = document.createElement('div');
          phaseContent.classList.add('tab-pane', 'fade');
          phaseContent.setAttribute('id', contentId);
          phaseContent.setAttribute('role', 'tabpanel');
          phaseContent.setAttribute('aria-labelledby', navId);
          phaseContent.setAttribute('tab-index', '0');
          if (!setActive) {
            phaseContent.classList.add('show', 'active');
            phaseContent.setAttribute('aria-selected', 'true');
          }

          let setRowContent = document.createElement('div');
          setRowContent.classList.add('row', 'bracket-phase');
          Object.entries(sets).forEach(([_, setNode]) => {
            if (setNode.slots[0].entrant === null || setNode.slots[1].entrant === null) {
              return;
            }

            let setContent = document.createElement('div');
            setContent.classList.add('col', 'mb-3', 'bracket-public');

            let roundHeader = document.createElement('div');
            roundHeader.classList.add('round-header');
            let roundRoot = document.createElement('div');
            roundRoot.classList.add('round-root');
            let roundDiv = document.createElement('div');
            let roundTitleContainer = document.createElement('div');
            roundTitleContainer.classList.add('round-title-container');
            let roundTitle = document.createElement('div');
            roundTitle.classList.add('round-title');
            roundTitle.innerText = setNode['fullRoundText'];

            roundTitleContainer.appendChild(roundTitle);
            roundDiv.appendChild(roundTitleContainer);
            roundRoot.appendChild(roundDiv);
            roundHeader.appendChild(roundRoot);
            setContent.appendChild(roundHeader);

            let matchNode = createMatch(setNode);
            matchNode.addEventListener('click', (event) => {
              let setId = event.currentTarget.getAttribute('data-set-id');
              fillMatchInfo(setIdObj[setId])
                .then(() => {
                  document.getElementById('offcanvasSGGSetsBtn').click();
                })
                .catch(err => {
                  console.log(err);
                  const toast = new bootstrap.Toast(document.getElementById('generalFailToast'));
                  toast.show();
                });
            });
            setContent.appendChild(matchNode);

            setRowContent.appendChild(setContent);
          });
          phaseContent.appendChild(setRowContent);

          document.getElementById('setPhases').appendChild(phaseNav);
          document.getElementById('setPhaseGroup').appendChild(phaseContent);
          setCount += 1;

          if (!setActive) {
            setActive = true;
          }
        });
      });

      document.getElementById('spinnerSGG').classList.add('d-none');
    })
    .catch(err => {
      console.log(err);
      const toast = new bootstrap.Toast(document.getElementById('findSetsFailToast'));
      toast.show();

      document.getElementById('setSelector').classList.add('d-none');
      document.getElementById('setNotice').classList.remove('d-none');
      document.getElementById('spinnerSGG').classList.add('d-none');
    })
};

const fillMatchInfo = async (matchNode) => {
  let player1Name = matchNode.slots[0]['entrant']['name'];
  let player2Name = matchNode.slots[1]['entrant']['name'];
  let round = matchNode['fullRoundText'];

  document.getElementById('player1Name').value = player1Name;
  document.getElementById('player2Name').value = player2Name;
  document.getElementById('round').value = round;

  adjustFormWithRound(round);
  resetScores();

  if (player1Name in playerObj) {
    loadPlayer1Character(playerObj[player1Name].char, playerObj[player1Name].skin);
    if (playerObj[player1Name].char2 && playerObj[player1Name].skin2) {
      loadPlayer1Character2(playerObj[player1Name].char2, playerObj[player1Name].skin2);
    }
  }

  if (player2Name in playerObj) {
    loadPlayer2Character(playerObj[player2Name].char, playerObj[player2Name].skin);
    if (playerObj[player2Name].char2 && playerObj[player2Name].skin2) {
      loadPlayer2Character2(playerObj[player2Name].char2, playerObj[player2Name].skin2);
    }
  }
};

const adjustFormWithEvent = async (event) => {
  if (event.endsWith('Doubles')) {
    let doublesCharDivs = document.getElementsByClassName('doubles-char');
    for (let i = 0; i < doublesCharDivs.length; i++) {
      doublesCharDivs[i].classList.remove('d-none');
    }
  } else {
    let doublesCharDivs = document.getElementsByClassName('doubles-char');
    for (let i = 0; i < doublesCharDivs.length; i++) {
      doublesCharDivs[i].classList.add('d-none');
    }
  }
}

const adjustFormWithRound = async (round) => {
  if (round === 'Grand Final' || round === 'Grand Final Reset') {
    if (round === 'Grand Final') {
      document.getElementById('player1LCheck').checked = false;
      document.getElementById('player2LCheck').checked = true;
    }
    if (round === 'Grand Final Reset') {
      document.getElementById('player1LCheck').checked = true;
      document.getElementById('player2LCheck').checked = true;
    }
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
}

const clearForm = async () => {
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

  clearPlayers();
  clearCommentators();
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
  let player1CharImgs = document.getElementsByClassName('img-player-1-char');
  for (let i = 0; i < player1CharImgs.length; i++) {
    player1CharImgs[i].style.backgroundColor = hex;
  }
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
  let player2CharImgs = document.getElementsByClassName('img-player-2-char');
  for (let i = 0; i < player2CharImgs.length; i++) {
    player2CharImgs[i].style.backgroundColor = hex;
  }
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
    colourName.textContent = colourObj[i].name;

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
    colourName.textContent = colourObj[i].name;

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
  const player1Char2SS = document.getElementById('player1Char2SS');
  const player2Char2SS = document.getElementById('player2Char2SS');
  player1CharSS.replaceChildren();
  player2CharSS.replaceChildren();
  player1Char2SS.replaceChildren();
  player2Char2SS.replaceChildren();

  characterList = await window.fsAPI.fetch.characterList();
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

    let p1Char2SSDiv = document.createElement('div');
    p1Char2SSDiv.setAttribute('class', 'modal-char-select');

    let p1Char2SSImg = document.createElement('img');
    p1Char2SSImg.setAttribute('data-bs-dismiss', 'modal');
    p1Char2SSImg.setAttribute('src', `data:image/png;base64,${characterSelectScreen}`);
    p1Char2SSImg.setAttribute('alt', characterList[i]);
    p1Char2SSImg.addEventListener('click', (event) => { loadPlayer1Character2(event.target.getAttribute('alt')) });

    p1Char2SSDiv.appendChild(p1Char2SSImg);

    let p2Char2SSDiv = document.createElement('div');
    p2Char2SSDiv.setAttribute('class', 'modal-char-select');

    let p2Char2SSImg = document.createElement('img');
    p2Char2SSImg.setAttribute('data-bs-dismiss', 'modal');
    p2Char2SSImg.setAttribute('src', `data:image/png;base64,${characterSelectScreen}`);
    p2Char2SSImg.setAttribute('alt', characterList[i]);
    p2Char2SSImg.addEventListener('click', (event) => { loadPlayer2Character2(event.target.getAttribute('alt')) });

    p2Char2SSDiv.appendChild(p2Char2SSImg);

    player1CharSS.appendChild(p1CharSSDiv);
    player2CharSS.appendChild(p2CharSSDiv);
    player1Char2SS.appendChild(p1Char2SSDiv);
    player2Char2SS.appendChild(p2Char2SSDiv);
  }

  loadPlayer1Character(characterList[characterList.length - 1]);
  loadPlayer2Character(characterList[characterList.length - 1]);
  loadPlayer1Character2(characterList[characterList.length - 1]);
  loadPlayer2Character2(characterList[characterList.length - 1]);
};

const loadPlayer1Character = async (character, skin = '') => {
  document.getElementById('player1Char').value = character;
  loadPlayer1CharacterIcons(character, skin);
};

const loadPlayer2Character = async (character, skin = '') => {
  document.getElementById('player2Char').value = character;
  loadPlayer2CharacterIcons(character, skin);
};

const loadPlayer1Character2 = async (character, skin = '') => {
  document.getElementById('player1Char2').value = character;
  loadPlayer1Character2Icons(character, skin);
};

const loadPlayer2Character2 = async (character, skin = '') => {
  document.getElementById('player2Char2').value = character;
  loadPlayer2Character2Icons(character, skin);
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
    p1Label.setAttribute('class', 'btn btn-outline-danger btn-sm btn-skin');
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
    p2Label.setAttribute('class', 'btn btn-outline-danger btn-sm btn-skin');
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

const loadPlayer1Character2Icons = async (character, skin = '') => {
  const skinDiv = document.getElementById('player1Skin2Div');
  skinDiv.replaceChildren();

  const characterIcons = await window.fsAPI.fetch.characterIcons(character);
  for (let i = 0; i < characterIcons.length; i++) {
    let p1Input2 = document.createElement('input');
    p1Input2.setAttribute('class', 'btn-check btn-player-1-skin-2');
    p1Input2.setAttribute('type', 'radio');
    p1Input2.setAttribute('name', 'player1Skin2');
    p1Input2.setAttribute('id', `player1Skin2${i}`);
    p1Input2.setAttribute('value', characterIcons[i].name);
    p1Input2.setAttribute('autocomplete', 'off');
    if (skin === characterIcons[i].name || i === 0) {
      p1Input2.setAttribute('checked', '');
    }

    let p1Label2 = document.createElement('label');
    p1Label2.setAttribute('class', 'btn btn-outline-danger btn-sm btn-skin');
    p1Label2.setAttribute('for', 'player1Skin2' + i);

    let p1Icon2 = document.createElement('img');
    p1Icon2.setAttribute('src', `data:image/png;base64,${characterIcons[i].base64}`);
    p1Icon2.setAttribute('alt', i);

    p1Label2.appendChild(p1Icon2);

    skinDiv.appendChild(p1Input2);
    skinDiv.appendChild(p1Label2);
  };

  if (skin === '' && characterIcons.length) {
    skin = document.querySelector('input[name="player1Skin2"]:checked').value;
  }
  loadPlayer1Character2Render(character, skin);
  let player1Skin2Btns = document.getElementsByClassName('btn-player-1-skin-2');
  for (let i = 0; i < player1Skin2Btns.length; i++) {
    player1Skin2Btns[i].addEventListener('click', (event) => {
      loadPlayer1Character2Render(document.getElementById('player1Char2').value, event.target.value);
    });
  }
};

const loadPlayer2Character2Icons = async (character, skin = '') => {
  const skinDiv = document.getElementById('player2Skin2Div');
  skinDiv.replaceChildren();

  const characterIcons = await window.fsAPI.fetch.characterIcons(character);
  for (let i = 0; i < characterIcons.length; i++) {
    let p2Input2 = document.createElement('input');
    p2Input2.setAttribute('class', 'btn-check btn-player-2-skin-2');
    p2Input2.setAttribute('type', 'radio');
    p2Input2.setAttribute('name', 'player2Skin2');
    p2Input2.setAttribute('id', `player2Skin2${i}`);
    p2Input2.setAttribute('value', characterIcons[i].name);
    p2Input2.setAttribute('autocomplete', 'off');
    if (skin === characterIcons[i].name || i === 0) {
      p2Input2.setAttribute('checked', '');
    }

    let p2Label2 = document.createElement('label');
    p2Label2.setAttribute('class', 'btn btn-outline-danger btn-sm btn-skin');
    p2Label2.setAttribute('for', 'player2Skin2' + i);

    let p2Icon2 = document.createElement('img');
    p2Icon2.setAttribute('src', `data:image/png;base64,${characterIcons[i].base64}`);
    p2Icon2.setAttribute('alt', i);

    p2Label2.appendChild(p2Icon2);

    skinDiv.appendChild(p2Input2);
    skinDiv.appendChild(p2Label2);
  };

  if (skin === '' && characterIcons.length) {
    skin = document.querySelector('input[name="player2Skin2"]:checked').value;
  }
  loadPlayer2Character2Render(character, skin);
  let player2Skin2Btns = document.getElementsByClassName('btn-player-2-skin-2');
  for (let i = 0; i < player2Skin2Btns.length; i++) {
    player2Skin2Btns[i].addEventListener('click', (event) => {
      loadPlayer2Character2Render(document.getElementById('player2Char2').value, event.target.value);
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

const loadPlayer1Character2Render = async (character, skin) => {
  const characterRender = await window.fsAPI.fetch.characterRender(character, skin);
  document.getElementById('player1Skin2RenderImg').setAttribute('src', `data:image/png;base64,${characterRender}`);
};

const loadPlayer2Character2Render = async (character, skin) => {
  const characterRender = await window.fsAPI.fetch.characterRender(character, skin);
  document.getElementById('player2Skin2RenderImg').setAttribute('src', `data:image/png;base64,${characterRender}`);
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
  const player1Char2 = document.getElementById('player1Char2').value;
  const player2Char2 = document.getElementById('player2Char2').value;

  const player1Name = document.getElementById('player1Name').value;
  const player2Name = document.getElementById('player2Name').value;

  const player1Skin = document.querySelector('input[name="player1Skin"]:checked') ? document.querySelector('input[name="player1Skin"]:checked').value : '';
  const player2Skin = document.querySelector('input[name="player2Skin"]:checked') ? document.querySelector('input[name="player2Skin"]:checked').value : '';
  const player1Skin2 = document.querySelector('input[name="player1Skin2"]:checked') ? document.querySelector('input[name="player1Skin2"]:checked').value : '';
  const player2Skin2 = document.querySelector('input[name="player2Skin2"]:checked') ? document.querySelector('input[name="player2Skin2"]:checked').value : '';

  document.getElementById('player1Score').value = player2Score;
  document.getElementById('player2Score').value = player1Score;

  document.getElementById('player1LCheck').checked = player2LCheck;
  document.getElementById('player2LCheck').checked = player1LCheck;

  document.getElementById('player1Char').value = player2Char;
  document.getElementById('player2Char').value = player1Char;
  document.getElementById('player1Char2').value = player2Char2;
  document.getElementById('player2Char2').value = player1Char2;

  document.getElementById('player1Name').value = player2Name;
  document.getElementById('player2Name').value = player1Name;

  loadPlayer1CharacterIcons(player2Char, player2Skin);
  loadPlayer2CharacterIcons(player1Char, player1Skin);
  loadPlayer1Character2Icons(player2Char2, player2Skin2);
  loadPlayer2Character2Icons(player1Char2, player1Skin2);
};

const clearPlayers = async () => {
  resetScores();

  document.getElementById('player1LCheck').checked = false;
  document.getElementById('player2LCheck').checked = false;

  document.getElementById('player1Name').value = '';
  document.getElementById('player2Name').value = '';

  loadPlayer1Character(characterList[characterList.length - 1]);
  loadPlayer2Character(characterList[characterList.length - 1]);
  loadPlayer1Character2(characterList[characterList.length - 1]);
  loadPlayer2Character2(characterList[characterList.length - 1]);
};

const copySetToClipboard = async () => {
  let text = "";

  const player1Char = document.getElementById('player1Char').value;
  const player2Char = document.getElementById('player2Char').value;
  const player1Name = document.getElementById('player1Name').value;
  const player2Name = document.getElementById('player2Name').value;
  const round = document.getElementById('round').value;

  const event = document.getElementById('eventName').value;
  if (event.endsWith('Doubles')) {
    const player1Char2 = document.getElementById('player1Char2').value;
    const player2Char2 = document.getElementById('player2Char2').value;

    text = `${player1Name} (${player1Char} / ${player1Char2}) vs. ${player2Name} (${player2Char} / ${player2Char2}) - ${round}`;
  } else {
    text = `${player1Name} (${player1Char}) vs. ${player2Name} (${player2Char}) - ${round}`;
  }

  navigator.clipboard.writeText(text);
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

const validatePlayerObj = async (newPlayerObj) => {
  newPlayerObj = JSON.parse(newPlayerObj);

  for (const [player, info] of Object.entries(newPlayerObj)) {
    if (player.trim() == '') {
      throw 'Invalid Player Object';
    }

    let infoKeys = Object.keys(info);
    if (
      (infoKeys.length !== 2 || !(infoKeys.includes('char') && infoKeys.includes('skin'))) ||
      (infoKeys.length !== 4 || !(infoKeys.includes('char') && infoKeys.includes('skin') && infoKeys.includes('char2') && infoKeys.includes('skin2')))
    ) {
      throw 'Invalid Player Object';
    }
  }

  return newPlayerObj;
};

const editPlayerObj = async (newPlayerObj) => {
  playerObj = newPlayerObj;

  const playerListDatalist = document.getElementById('playerList');
  playerListDatalist.replaceChildren();

  for (let player in playerObj) {
    let playerListOption = document.createElement('option');
    playerListOption.setAttribute('value', player);
    playerListDatalist.appendChild(playerListOption)
  }

  window.fsAPI.save.playerObj(playerObj);
};

const updatePlayerObj = async (infoObj) => {
  let player1Name = infoObj['player1Name'].trim();
  let player1Char = infoObj['player1Char'];
  let player1Skin = infoObj['player1Skin'];
  let player1Char2 = infoObj['player1Char2'];
  let player1Skin2 = infoObj['player1Skin2'];

  if (player1Name !== '') {
    playerObj[player1Name] = { char: player1Char, skin: player1Skin };

    if (player1Char2 && player1Skin2) {
      playerObj[player1Name]['char2'] = player1Char2;
      playerObj[player1Name]['skin2'] = player1Skin2;
    }
  }

  let player2Name = infoObj['player2Name'].trim();
  let player2Char = infoObj['player2Char'];
  let player2Skin = infoObj['player2Skin'];
  let player2Char2 = infoObj['player2Char2'];
  let player2Skin2 = infoObj['player2Skin2'];

  if (player2Name !== '') {
    playerObj[player2Name] = { char: player2Char, skin: player2Skin };

    if (player2Char2 && player2Skin2) {
      playerObj[player2Name]['char2'] = player2Char2;
      playerObj[player2Name]['skin2'] = player2Skin2;
    }
  }

  const playerListDatalist = document.getElementById('playerList');
  playerListDatalist.replaceChildren();

  for (let player in playerObj) {
    let playerListOption = document.createElement('option');
    playerListOption.setAttribute('value', player);
    playerListDatalist.appendChild(playerListOption)
  }

  window.fsAPI.save.playerObj(playerObj);
};

const saveInfoObj = async (infoObj) => {
  let success = await window.fsAPI.save.infoObj(infoObj);
  if (success) {
    const toast = new bootstrap.Toast(document.getElementById('saveInfoSuccessToast'));
    toast.show();
  } else {
    const toast = new bootstrap.Toast(document.getElementById('saveInfoFailToast'));
    toast.show();
  }
};

// Call functions for initial rendering

loadSettings();
loadPlayer1ColourSet();
loadPlayer2ColourSet();
loadCharacterList();
loadPlayerObj();

// Set listeners

document.getElementById('offcanvasSGGSets').addEventListener('show.bs.offcanvas', () => {
  const eventId = document.getElementById('event').value;
  const apiToken = document.getElementById('apiToken').value;
  if (eventId && apiToken) {
    populateSets(eventId, apiToken);
  }
});

document.getElementById('apiTokenSaveBtn').addEventListener('click', () => {
  document.getElementById('event').replaceChildren();
  document.getElementById('setPhases').replaceChildren();
  document.getElementById('setPhaseGroup').replaceChildren();
  document.getElementById('setSelector').classList.add('d-none');
  document.getElementById('setNotice').classList.remove('d-none');

  const apiToken = document.getElementById('apiToken').value;
  populateTournaments(apiToken);

  // Save API token on form save (does not have to be valid token)
  window.fsAPI.fetch.settingsObj()
    .then(settingsObj => {
      settingsObj['api.token'] = apiToken;
      window.fsAPI.save.settingsObj(settingsObj);
    });
});

document.getElementById('tournament').addEventListener('change', (event) => {
  document.getElementById('setPhases').replaceChildren();
  document.getElementById('setPhaseGroup').replaceChildren();
  document.getElementById('setSelector').classList.add('d-none');
  document.getElementById('setNotice').classList.remove('d-none');

  const tournamentId = event.target.value;
  const apiToken = document.getElementById('apiToken').value;
  populateEvents(tournamentId, apiToken);

  const tournamentName = event.target.options[event.target.selectedIndex].text;
  document.getElementById('tournamentName').value = tournamentName;
});

document.getElementById('event').addEventListener('change', (event) => {
  const eventId = event.target.value;
  const apiToken = document.getElementById('apiToken').value;
  populateSets(eventId, apiToken)
    .then(() => {
      const toast = new bootstrap.Toast(document.getElementById('loadSetsSuccessToast'));
      toast.show();
    });

  const eventName = event.target.options[event.target.selectedIndex].text;
  document.getElementById('eventName').value = eventName;
  adjustFormWithEvent(eventName);
});

document.getElementById('eventName').addEventListener('change', (event) => {
  adjustFormWithEvent(event.target.value);
});

document.getElementById('round').addEventListener('change', (event) => {
  adjustFormWithRound(event.target.value);
});

document.getElementById('clearForm').addEventListener('click', () => {
  clearForm();
});

document.getElementById('refreshAssets').addEventListener('click', () => {
  loadCharacterList();
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

document.getElementById('resetScores').addEventListener('click', () => {
  resetScores();
});

document.getElementById('swapPlayers').addEventListener('click', () => {
  swapPlayers();
});

document.getElementById('clearPlayers').addEventListener('click', () => {
  clearPlayers();
});

document.getElementById('copySet').addEventListener('click', (event) => {
  copySetToClipboard()
    .then(() => {
      const btnTarget = event.currentTarget;
      btnTarget.children.item(0).setAttribute('src', 'assets/images/svg/clipboard-check.svg');
      setTimeout(() => {
        btnTarget.children.item(0).setAttribute('src', 'assets/images/svg/clipboard.svg');
      }, 1000);
    })
    .catch(err => {
      console.log(err);
      const toast = new bootstrap.Toast(document.getElementById('generalFailToast'));
      toast.show();
    });
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

document.getElementById('offcanvasSettings').addEventListener('show.bs.offcanvas', () => {
  document.getElementById('editPlayersJSON').value = JSON.stringify(playerObj, null, 2);
});

document.getElementById('playersForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const serializedInfo = Object.fromEntries(formData.entries());

  validatePlayerObj(serializedInfo['editPlayersJSON'])
    .then(newPlayerJSON => editPlayerObj(newPlayerJSON))
    .then(() => {
      const toast = new bootstrap.Toast(document.getElementById('savePlayerInfoSuccessToast'));
      toast.show();
    })
    .catch(err => {
      console.log(err);
      if (err instanceof SyntaxError) {
        const toast = new bootstrap.Toast(document.getElementById('syntaxPlayerInfoFailToast'));
        toast.show();
      } else if (err === 'Invalid Player Object') {
        const toast = new bootstrap.Toast(document.getElementById('validatePlayerInfoFailToast'));
        toast.show();
      } else {
        const toast = new bootstrap.Toast(document.getElementById('savePlayerInfoFailToast'));
        toast.show();
      }
    });
});

// Enable tooltips

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle-tooltip="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

// Set mouse bindings

Mousetrap.bind(['1'], () => { incrementP1Score() });
Mousetrap.bind(['2'], () => { incrementP2Score() });
Mousetrap.bind(['esc'], () => { resetScores() });
Mousetrap.bind(['enter'], () => { if (document.activeElement.tagName === 'BODY') document.getElementById('submitFormBtn').click(); });
