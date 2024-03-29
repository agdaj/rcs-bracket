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

let saveFormat = 'json';
let characterList = [];
let customFieldsObj = {};
let playerObj = {};

// start.gg Interfacing

const perPage = 10;

const CREATED = 1;
const ACTIVE = 2;
const COMPLETED = 3;
const CALLED = 6;

let tournamentId = null;
let timerList = [];
let streamObj = {};
let setIdObj = {};

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
                  user {
                    genderPronoun
                  }
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
            startedAt
            state
            stream {
              streamName
              streamSource
            }
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

const queryStreamQueue = async (tournamentId, apiToken) => {
  const query = `
    query StreamQueueQuery($tournamentId: ID!) {
      tournament(id: $tournamentId) {
        streamQueue {
          sets {
            id
          }
          stream {
            streamName
            streamSource
          }
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

const createMatch = (matchNode) => {
  let match = document.createElement('div');
  match.classList.add('match', 'has-identifier', 'reportable');
  if (
    (matchNode.state !== COMPLETED && matchNode.state !== CALLED) &&
    (matchNode.slots[0].entrant !== null && matchNode.slots[1].entrant !== null)
  ) {
    match.classList.add('playable');
  }
  if (matchNode.state === ACTIVE) {
    match.classList.add('in-progress');
  }
  if (matchNode.state === CALLED) {
    match.classList.add('called');
  }
  match.setAttribute('data-set-id', matchNode.id);

  let matchAffixWrapper = document.createElement('div');
  matchAffixWrapper.classList.add('match-affix-wrapper');

  let matchSectionTop = document.createElement('div');
  matchSectionTop.classList.add('match-section', 'match-section-top');
  matchSectionTop.appendChild(createMatchSectionWrapper(matchNode.slots[0], matchNode.state));

  let matchSpacer = document.createElement('div');
  matchSpacer.classList.add('match-spacer');

  let matchSectionBottom = document.createElement('div');
  matchSectionBottom.classList.add('match-section', 'match-section-bottom');
  matchSectionBottom.appendChild(createMatchSectionWrapper(matchNode.slots[1], matchNode.state));

  let matchStation = document.createTextNode('');
  if (
    (matchNode.state !== COMPLETED && matchNode.stream) ||
    (matchNode.state === ACTIVE || matchNode.state === CALLED)
  ) {
    matchStation = createMatchStation(matchNode.stream, matchNode.state, matchNode.startedAt);
  }

  matchAffixWrapper.append(
    matchSectionTop,
    matchSpacer,
    matchSectionBottom,
    matchStation,
    createIdentifierLabel(matchNode.identifier)
  );
  match.appendChild(matchAffixWrapper);
  return match;
};

const createMatchSectionWrapper = (slot, state) => {
  let matchPlayerName = document.createElement('div');
  matchPlayerName.classList.add('matchSectionWrapper');

  let matchPlayer = document.createElement('div');
  matchPlayer.classList.add('match-player', 'entrant');

  matchPlayer.appendChild(createMatchPlayerName(slot.entrant));
  if (slot.standing !== null) {
    matchPlayer.appendChild(createMatchPlayerInfo(slot.standing, state));

    if (slot.standing.stats.score.value !== null && state !== ACTIVE) {
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

const createMatchPlayerInfo = (standing, state) => {
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
  } else if (standing.stats.score.value !== null || state === ACTIVE) {
    let matchScore = standing.stats.score.value;
    let matchPlayerStocks = document.createElement('div');
    matchPlayerStocks.classList.add('match-player-stocks');
    if (state == ACTIVE) {
      if (matchScore === null) {
        matchScore = 0;
      }
      matchPlayerStocks.classList.add('match-in-progress');
    }
    matchPlayerStocks.innerText = matchScore;

    matchPlayerInfo.appendChild(matchPlayerStocks);
  }
  return matchPlayerInfo;
};

const createMatchStation = (stream, state, startedAt) => {
  let matchStation = document.createElement('div');
  matchStation.classList.add('match-station');

  let matchStationInner = document.createElement('div');

  if (stream) {
    let matchStreamOuter = document.createElement('div');

    let matchStream = document.createElement('div');
    if (stream.streamSource === 'TWITCH') {
      let streamSVG = document.createElement('img');
      streamSVG.setAttribute('src', 'assets/images/svg/twitch.svg');
      streamSVG.classList.add('btn-close-white');
      matchStream.appendChild(streamSVG);
    } else {
      let streamSVG = document.createElement('img');
      streamSVG.setAttribute('src', 'assets/images/svg/headset.svg');
      streamSVG.classList.add('btn-close-white');
      matchStream.appendChild(streamSVG);
    }

    let matchStreamName = document.createElement('div');
    matchStreamName.classList.add('stream-name', 'text-xs');
    matchStreamName.textContent = stream.streamName;

    matchStreamOuter.append(matchStream, matchStreamName);
    matchStationInner.appendChild(matchStreamOuter);
  } else if (state === CALLED) {
    let matchCalled = document.createElement('div');

    let bellSVG = document.createElement('img');
    bellSVG.setAttribute('src', 'assets/images/svg/bell.svg');
    bellSVG.classList.add('btn-close-white', 'bell-o');
    matchCalled.appendChild(bellSVG);

    matchStationInner.appendChild(matchCalled);
  }

  if (state === ACTIVE || state === CALLED) {
    let matchTimerSpacer = document.createTextNode('');
    if (stream || state === CALLED) {
      matchTimerSpacer = document.createElement('div');
      matchTimerSpacer.classList.add('match-timer-spacer');
    }

    let matchTimer = document.createElement('div');
    matchTimer.classList.add('match-timer');

    let seconds = Math.floor((Date.now() - (startedAt * 1000)) / 1000);
    let minutes = Math.floor(seconds / 60);
    let extraSeconds = seconds % 60;
    minutes = minutes < 0 ? "0" + minutes : minutes;
    extraSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;

    let matchTimerSpan = document.createElement('span');
    timerList.push(setInterval(() => {
      let seconds = Math.floor((Date.now() - (startedAt * 1000)) / 1000);
      let minutes = Math.floor(seconds / 60);
      let extraSeconds = seconds % 60;
      minutes = minutes < 0 ? "0" + minutes : minutes;
      extraSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;

      matchTimerSpan.textContent = `${minutes}:${extraSeconds}`;
    }, 1000));
    matchTimerSpan.textContent = `${minutes}:${extraSeconds}`;
    matchTimer.appendChild(matchTimerSpan);

    matchStationInner.append(matchTimerSpacer, matchTimer);
  }

  matchStation.appendChild(matchStationInner);
  return matchStation;
}

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

// Custom Fields Interfacing

const createCustomGroup = (groupName = '', fieldsObj = {}) => {
  let groupId = 0;
  while (document.getElementById(`custom-group-${groupId}-name`)) {
    groupId ++;
  }

  let customGroupItem = document.createElement('li');
  customGroupItem.classList.add('list-group-item');

  let customGroupDiv = document.createElement('div');
  customGroupDiv.classList.add('d-flex', 'd-flex-row', 'mb-2');

  let customGroupRemoveBtn = document.createElement('button');
  customGroupRemoveBtn.classList.add('btn', 'btn-link', 'btn-link-danger', 'btn-sm', 'flex-shrink-1', 'ps-0', 'pe-1');
  customGroupRemoveBtn.setAttribute('type', 'button');
  customGroupRemoveBtn.addEventListener('click', (event) => { event.currentTarget.parentNode.parentNode.remove() });

  let customGroupRemoveImg = document.createElement('img');
  customGroupRemoveImg.setAttribute('src', 'assets/images/svg/folder-minus.svg');

  customGroupRemoveBtn.appendChild(customGroupRemoveImg);

  let customGroupInputGroup = document.createElement('div');
  customGroupInputGroup.classList.add('input-group', 'input-group-sm', 'flex-grow-1');

  let customGroupSpan = document.createElement('span');
  customGroupSpan.classList.add('input-group-text');
  customGroupSpan.textContent = 'Name';

  let customGroupInput = document.createElement('input');
  customGroupInput.classList.add('form-control');
  customGroupInput.setAttribute('type', 'text');
  customGroupInput.setAttribute('id', `custom-group-${groupId}-name`);
  customGroupInput.setAttribute('name', `custom-group-${groupId}-name`);
  customGroupInput.setAttribute('value', groupName);
  customGroupInput.required = true;

  customGroupInputGroup.appendChild(customGroupSpan);
  customGroupInputGroup.appendChild(customGroupInput);

  customGroupDiv.appendChild(customGroupRemoveBtn);
  customGroupDiv.appendChild(customGroupInputGroup);

  let customFieldList = document.createElement('ul');
  customFieldList.classList.add('list-group', 'list-group-flush');

  let fieldId = 0;
  let customFieldItems = [];
  for (const [fieldName, fieldText] of Object.entries(fieldsObj)) {
    customFieldItems.push(createCustomField(groupId, fieldId, fieldName, fieldText));
    fieldId ++;
  }

  let customFieldAddBtn = document.createElement('button');
  customFieldAddBtn.classList.add('list-group-item', 'list-group-item-action');
  customFieldAddBtn.setAttribute('type', 'button');
  customFieldAddBtn.addEventListener('click', (event) => {
    event.currentTarget.parentNode.insertBefore(createCustomField(groupId), event.currentTarget);
  });

  let customFieldAddImg = document.createElement('img');
  customFieldAddImg.setAttribute('src', 'assets/images/svg/plus-circle.svg');

  customFieldAddBtn.appendChild(customFieldAddImg);
  customFieldAddBtn.appendChild(document.createTextNode(" Add Field"));

  for (let i = 0; i < customFieldItems.length; i++) {
    customFieldList.appendChild(customFieldItems[i]);
  }
  customFieldList.appendChild(customFieldAddBtn);

  customGroupItem.appendChild(customGroupDiv);
  customGroupItem.appendChild(customFieldList);
  return customGroupItem;
};

const createCustomField = (groupId, fieldId = 0, fieldName = '', fieldText = '') => {
  while (document.getElementById(`custom-field-${groupId}-${fieldId}-name`)) {
    fieldId ++;
  }

  let customFieldItem = document.createElement('li');
  customFieldItem.classList.add('list-group-item');

  let customFieldDiv = document.createElement('div');
  customFieldDiv.classList.add('d-flex', 'd-flex-row');

  let customFieldRemoveBtn = document.createElement('button');
  customFieldRemoveBtn.classList.add('btn', 'btn-link', 'btn-link-danger', 'btn-sm', 'flex-shrink-1', 'ps-0', 'pe-1');
  customFieldRemoveBtn.setAttribute('type', 'button');
  customFieldRemoveBtn.addEventListener('click', (event) => { event.currentTarget.parentNode.parentNode.remove() });

  let customFieldRemoveImg = document.createElement('img');
  customFieldRemoveImg.setAttribute('src', 'assets/images/svg/dash-circle.svg');

  customFieldRemoveBtn.appendChild(customFieldRemoveImg);

  let customFieldInputGroup = document.createElement('div');
  customFieldInputGroup.classList.add('input-group', 'input-group-sm', 'flex-grow-1');

  let customFieldNameInput = document.createElement('input');
  customFieldNameInput.classList.add('form-control');
  customFieldNameInput.setAttribute('type', 'text');
  customFieldNameInput.setAttribute('id', `custom-field-${groupId}-${fieldId}-name`);
  customFieldNameInput.setAttribute('name', `custom-field-${groupId}-${fieldId}-name`);
  customFieldNameInput.setAttribute('placeholder', 'Field');
  customFieldNameInput.setAttribute('value', fieldName);
  customFieldNameInput.required = true;

  let customFieldTextInput = document.createElement('input');
  customFieldTextInput.classList.add('form-control', 'w-50');
  customFieldTextInput.setAttribute('type', 'text');
  customFieldTextInput.setAttribute('id', `custom-field-${groupId}-${fieldId}-text`);
  customFieldTextInput.setAttribute('name', `custom-field-${groupId}-${fieldId}-text`);
  customFieldTextInput.setAttribute('placeholder', 'Text');
  customFieldTextInput.setAttribute('value', fieldText);

  customFieldInputGroup.appendChild(customFieldNameInput);
  customFieldInputGroup.appendChild(customFieldTextInput);

  customFieldDiv.appendChild(customFieldRemoveBtn);
  customFieldDiv.appendChild(customFieldInputGroup);

  customFieldItem.appendChild(customFieldDiv);
  return customFieldItem;
};

const createCustomGroupAddBtn = () => {
  let customGroupAddBtn = document.createElement('button');
  customGroupAddBtn.classList.add('list-group-item', 'list-group-item-action');
  customGroupAddBtn.setAttribute('type', 'button');
  customGroupAddBtn.addEventListener('click', (event) => {
    event.currentTarget.parentNode.insertBefore(createCustomGroup(), event.currentTarget);
  });

  let customGroupAddImg = document.createElement('img');
  customGroupAddImg.setAttribute('src', 'assets/images/svg/folder-plus.svg');

  customGroupAddBtn.appendChild(customGroupAddImg);
  customGroupAddBtn.appendChild(document.createTextNode(" Add Group"));
  return customGroupAddBtn;
};

// Initialize functions

const loadSettings = async () => {
  let settingsObj = await window.fsAPI.fetch.settingsObj();

  let apiToken = settingsObj['api.token'];

  document.getElementById('apiToken').value = apiToken;

  saveFormat = settingsObj['save.format'];
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
    });
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
    });
};

const populateSets = async (eventId, apiToken) => {
  for (let i = 0; i < timerList.length; i++) {
    clearInterval(timerList[i]);
  }
  timerList = [];
  streamObj = {};
  setIdObj = {};
  document.getElementById('setPhases').replaceChildren();
  document.getElementById('setPhaseGroup').replaceChildren();
  document.getElementById('setStreams').replaceChildren();
  document.getElementById('setStreamGroup').replaceChildren();
  document.getElementById('setNotice').classList.add('d-none');
  document.getElementById('setMeta').classList.remove('d-none');
  let setExtent = document.getElementById('setExtent').value;
  if (setExtent === 'Sets by Phase - Group') {
    document.getElementById('setSelector').classList.remove('d-none');
  } else if (setExtent === 'Sets by Stream Queue') {
    document.getElementById('setStreamSelector').classList.remove('d-none');
  }
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
          phaseNav.style.width = '100%';

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
          setRowContent.classList.add('row', 'g-0', 'bracket-phase');
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
    })
    .then(() => queryStreamQueue(tournamentId, apiToken))
    .then(response => response.json())
    .then(response => {
      if (response['data']['tournament']['streamQueue'] === null) {
        response['data']['tournament']['streamQueue'] = [];
      }

      response['data']['tournament']['streamQueue'].forEach(node => {
        let streamName = node['stream']['streamName'];
        let streamSource = node['stream']['streamSource'];

        streamObj[streamName] = {
          'source': streamSource,
          'sets': []
        };

        node['sets'].forEach(setNode => {
          streamObj[streamName]['sets'].push(setNode['id']);
        });
      })

      let setActive = false;
      Object.entries(streamObj).forEach(([streamName, streamInfoObj]) => {
        let streamLabel = document.createElement("span");
        let streamSource = streamInfoObj['source'];
        if (streamSource === 'TWITCH') {
          let streamSVG = document.createElement('img');
          streamSVG.setAttribute('src', 'assets/images/svg/twitch.svg');
          streamSVG.classList.add('btn-close-white');
          streamLabel.appendChild(streamSVG);
        } else {
          let streamSVG = document.createElement('img');
          streamSVG.setAttribute('src', 'assets/images/svg/headset.svg');
          streamSVG.classList.add('btn-close-white');
          streamLabel.appendChild(streamSVG);
        }
        streamLabel.appendChild(document.createTextNode(" " + streamName));

        let navId = 'phase-nav-' + streamName;
        let contentId = 'phase-content-' + streamName;

        let streamNav = document.createElement("li");
        streamNav.classList.add("nav-item");
        streamNav.setAttribute('role', 'presentation');
        streamNav.setAttribute('data-bs-toggle-tooltip', 'tooltip');
        streamNav.setAttribute('data-bs-placement', 'top');
        streamNav.setAttribute('data-bs-title', streamName);
        streamNav.style.width = '100%';
        new bootstrap.Tooltip(streamNav);

        let streamLink = document.createElement("a");
        streamLink.classList.add('nav-link', 'text-ellipsis');
        streamLink.setAttribute('id', navId);
        streamLink.setAttribute('data-bs-toggle', 'pill');
        streamLink.setAttribute('data-bs-target', '#' + contentId);
        streamLink.setAttribute('type', 'button');
        streamLink.setAttribute('role', 'tab');
        streamLink.setAttribute('aria-controls', contentId);
        streamLink.setAttribute('aria-selected', 'false');
        streamLink.appendChild(streamLabel);
        if (!setActive) {
          streamLink.classList.add('active');
          streamLink.setAttribute('aria-selected', 'true');
        }
        streamNav.appendChild(streamLink);

        let streamContent = document.createElement('div');
        streamContent.classList.add('tab-pane', 'fade');
        streamContent.setAttribute('id', contentId);
        streamContent.setAttribute('role', 'tabpanel');
        streamContent.setAttribute('aria-labelledby', navId);
        streamContent.setAttribute('tab-index', '0');
        if (!setActive) {
          streamContent.classList.add('show', 'active');
          streamContent.setAttribute('aria-selected', 'true');
        }

        let setRowContent = document.createElement('div');
        setRowContent.classList.add('row', 'g-0', 'bracket-phase');
        Object.values(streamInfoObj['sets']).forEach((setId) => {
          if (!(setId in setIdObj)) {
            return;
          }

          let setNode = setIdObj[setId];

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
        streamContent.appendChild(setRowContent);

        document.getElementById('setStreams').appendChild(streamNav);
        document.getElementById('setStreamGroup').appendChild(streamContent);

        if (!setActive) {
          setActive = true;
        }
      });

      document.getElementById('spinnerSGG').classList.add('d-none');
    })
    .catch(err => {
      console.log(err);
      const toast = new bootstrap.Toast(document.getElementById('findSetsFailToast'));
      toast.show();

      document.getElementById('setNotice').classList.remove('d-none');
      document.getElementById('setMeta').classList.add('d-none');
      document.getElementById('setSelector').classList.add('d-none');
      document.getElementById('setStreamSelector').classList.add('d-none');
      document.getElementById('spinnerSGG').classList.add('d-none');
    });
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

  if (
    matchNode.slots[0]['entrant']['participants'].length == 1 &&
    matchNode.slots[0]['entrant']['participants'][0]['user'] &&
    matchNode.slots[0]['entrant']['participants'][0]['user']['genderPronoun']
  ) {
    let player1Pronouns = matchNode.slots[0]['entrant']['participants'][0]['user']['genderPronoun'];
    document.getElementById('player1Pronouns').value = player1Pronouns;
  } else {
    document.getElementById('player1Pronouns').value = '';
  }

  if (
    matchNode.slots[1]['entrant']['participants'].length == 1 &&
    matchNode.slots[1]['entrant']['participants'][0]['user'] &&
    matchNode.slots[1]['entrant']['participants'][0]['user']['genderPronoun']
  ) {
    let player2Pronouns = matchNode.slots[1]['entrant']['participants'][0]['user']['genderPronoun'];
    document.getElementById('player2Pronouns').value = player2Pronouns;
  } else {
    document.getElementById('player2Pronouns').value = '';
  }

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
  if (
    round === 'Grand Final' || round === 'Grand Final Reset' ||
    round === 'Grand Finals' || round === 'Grand Finals Reset'
  ) {
    if (round === 'Grand Final' || round === 'Grand Finals') {
      document.getElementById('player1LCheck').checked = false;
      document.getElementById('player2LCheck').checked = true;
    }
    if (round === 'Grand Final Reset' || round === 'Grand Finals Reset') {
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

const copyPlayersToClipboard = async () => {
  let text = "";

  const player1Name = document.getElementById('player1Name').value;
  const player2Name = document.getElementById('player2Name').value;

  text = `${player1Name} vs. ${player2Name}`;

  navigator.clipboard.writeText(text);
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

  const player1CharSelect = document.getElementById('player1Char');
  const player2CharSelect = document.getElementById('player2Char');
  const player1Char2Select = document.getElementById('player1Char2');
  const player2Char2Select = document.getElementById('player2Char2');
  player1CharSelect.replaceChildren();
  player2CharSelect.replaceChildren();
  player1Char2Select.replaceChildren();
  player2Char2Select.replaceChildren();

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

  Object.values(characterList).sort().forEach((character) => {
    let char1Option = new Option(character);
    player1CharSelect.add(char1Option, undefined);
    let char2Option = new Option(character);
    player2CharSelect.add(char2Option, undefined);
    let char1Option2 = new Option(character);
    player1Char2Select.add(char1Option2, undefined);
    let char2Option2 = new Option(character);
    player2Char2Select.add(char2Option2, undefined);
  });

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
    playerListDatalist.appendChild(playerListOption);
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

  const player1Pronouns = document.getElementById('player1Pronouns').value;
  const player2Pronouns = document.getElementById('player2Pronouns').value;

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

  document.getElementById('player1Pronouns').value = player2Pronouns;
  document.getElementById('player2Pronouns').value = player1Pronouns;

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
  document.getElementById('player1Pronouns').value = '';
  document.getElementById('player2Pronouns').value = '';

  loadPlayer1Character(characterList[characterList.length - 1]);
  loadPlayer2Character(characterList[characterList.length - 1]);
  loadPlayer1Character2(characterList[characterList.length - 1]);
  loadPlayer2Character2(characterList[characterList.length - 1]);
};

const clearCommentators = async () => {
  document.getElementById('commentator1Name').value = '';
  document.getElementById('commentator2Name').value = '';
  document.getElementById('commentator1Pronouns').value = '';
  document.getElementById('commentator2Pronouns').value = '';
};

const swapCommentators = async () => {
  const commentator1Name = document.getElementById('commentator1Name').value;
  const commentator2Name = document.getElementById('commentator2Name').value;

  const commentator1Pronouns = document.getElementById('commentator1Pronouns').value;
  const commentator2Pronouns = document.getElementById('commentator2Pronouns').value;

  document.getElementById('commentator1Name').value = commentator2Name;
  document.getElementById('commentator2Name').value = commentator1Name;

  document.getElementById('commentator1Pronouns').value = commentator2Pronouns;
  document.getElementById('commentator2Pronouns').value = commentator1Pronouns;
};

const updateSaveSettingsObj = async (newSaveSettingsObj) => {
  saveFormat = newSaveSettingsObj['saveFormat'];

  // Update save settings
  let success = await window.fsAPI.fetch.settingsObj()
    .then(settingsObj => {
      settingsObj['save.format'] = saveFormat;
      return window.fsAPI.save.settingsObj(settingsObj);
    });
  if (success) {
    const toast = new bootstrap.Toast(document.getElementById('updateSaveSettingsSuccessToast'));
    toast.show();
  } else {
    const toast = new bootstrap.Toast(document.getElementById('updateSaveSettingsFailToast'));
    toast.show();
  }
};

const loadCustomFieldsObj = async () => {
  customFieldsObj = await window.fsAPI.fetch.customFieldsObj();
};

const createCustomFieldsFormFromObj = async (customFieldsObj) => {
  const customGroupsList = document.getElementById('customGroupsList');
  customGroupsList.replaceChildren();

  for (const [groupName, fieldsObj] of Object.entries(customFieldsObj)) {
    customGroupsList.appendChild(createCustomGroup(groupName, fieldsObj));
  };
  customGroupsList.appendChild(createCustomGroupAddBtn());
}

const updateCustomFieldsObj = async (newCustomFieldsObj) => {
  customFieldsObj = newCustomFieldsObj;

  window.fsAPI.save.customFieldsObj(customFieldsObj);
};

const editPlayerObj = async (newPlayerObj) => {
  validatePlayerObj(newPlayerObj)
    .then(newPlayerObj => updatePlayerObj(newPlayerObj))
    .then(() => {
      const toast = new bootstrap.Toast(document.getElementById('updatePlayerInfoSuccessToast'));
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
        const toast = new bootstrap.Toast(document.getElementById('updatePlayerInfoFailToast'));
        toast.show();
      }
    });
};

const validatePlayerObj = async (newPlayerObj) => {
  newPlayerObj = JSON.parse(newPlayerObj);

  for (const [player, info] of Object.entries(newPlayerObj)) {
    if (player.trim() == '') {
      throw 'Invalid Player Object';
    }

    let infoKeys = Object.keys(info);
    if (
      (infoKeys.length !== 2 || !(infoKeys.includes('char') && infoKeys.includes('skin'))) &&
      (infoKeys.length !== 4 || !(infoKeys.includes('char') && infoKeys.includes('skin') && infoKeys.includes('char2') && infoKeys.includes('skin2')))
    ) {
      throw 'Invalid Player Object';
    }
  }

  return newPlayerObj;
};

const updatePlayerObj = async (newPlayerObj) => {
  playerObj = newPlayerObj;

  const playerListDatalist = document.getElementById('playerList');
  playerListDatalist.replaceChildren();

  for (let player in playerObj) {
    let playerListOption = document.createElement('option');
    playerListOption.setAttribute('value', player);
    playerListDatalist.appendChild(playerListOption);
  }

  window.fsAPI.save.playerObj(playerObj);
};

const updatePlayerObjFromInfoObj = async (infoObj) => {
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
    playerListDatalist.appendChild(playerListOption);
  }

  window.fsAPI.save.playerObj(playerObj);
};

const saveInfoObj = async (infoObj) => {
  let success = await window.fsAPI.save.infoObj(infoObj, 'info.json');
  if (success) {
    const toast = new bootstrap.Toast(document.getElementById('saveInfoSuccessToast'));
    toast.show();
  } else {
    const toast = new bootstrap.Toast(document.getElementById('saveInfoFailToast'));
    toast.show();
  }
};

const saveInfoObjIndividual = async (infoObj) => {
  for (const [key, value] of Object.entries(infoObj)) {
    let success;
    if (['player1Skin', 'player2Skin', 'player1Skin2', 'player2Skin2'].includes(key)) {
      let fname = `${key}.png`;
      let character = infoObj[key.replace('Skin', 'Char')];
      let skin = value;

      success = await window.fsAPI.save.infoChar(character, skin, fname);
    } else {
      let fname = `${key}.txt`;
      let text = value;

      success = await window.fsAPI.save.infoText(text, fname);
    }

    if (!success) {
      const toast = new bootstrap.Toast(document.getElementById('saveInfoFailToast'));
      toast.show();
      return;
    }
  }

  const toast = new bootstrap.Toast(document.getElementById('saveInfoSuccessToast'));
  toast.show();
};

const saveCustomFieldsObj = async (customFieldsObj) => {
  let success = await window.fsAPI.save.infoObj(customFieldsObj, 'custom_fields.json');
  if (success) {
    const toast = new bootstrap.Toast(document.getElementById('saveCustomFieldsSuccessToast'));
    toast.show();
  } else {
    const toast = new bootstrap.Toast(document.getElementById('saveCustomFieldsFailToast'));
    toast.show();
  }
};

const saveCustomFieldsObjIndividual = async (customFieldsObj) => {
  for (const [_, fieldsObj] of Object.entries(customFieldsObj)) {
    for (const [key, value] of Object.entries(fieldsObj)) {
      let fname = `${key}.txt`;
      let text = value;

      let success = await window.fsAPI.save.infoText(text, fname);

      if (!success) {
        const toast = new bootstrap.Toast(document.getElementById('saveCustomFieldsFailToast'));
        toast.show();
        return;
      }
    }
  }

  const toast = new bootstrap.Toast(document.getElementById('saveCustomFieldsSuccessToast'));
  toast.show();
};

// Call functions for initial rendering

loadSettings();
loadPlayer1ColourSet();
loadPlayer2ColourSet();
loadCharacterList();
loadCustomFieldsObj();
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
  document.getElementById('setStreams').replaceChildren();
  document.getElementById('setStreamGroup').replaceChildren();
  document.getElementById('setNotice').classList.remove('d-none');
  document.getElementById('setMeta').classList.add('d-none');
  document.getElementById('setSelector').classList.add('d-none');
  document.getElementById('setStreamSelector').classList.add('d-none');

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
  document.getElementById('setStreams').replaceChildren();
  document.getElementById('setStreamGroup').replaceChildren();
  document.getElementById('setNotice').classList.remove('d-none');
  document.getElementById('setMeta').classList.add('d-none');
  document.getElementById('setSelector').classList.add('d-none');
  document.getElementById('setStreamSelector').classList.add('d-none');

  tournamentId = event.target.value;
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

document.getElementById('setExtent').addEventListener('change', (event) => {
  let setExtent = event.target.value;
  if (setExtent === 'Sets by Phase - Group') {
    document.getElementById('setSelector').classList.remove('d-none');
    document.getElementById('setStreamSelector').classList.add('d-none');
  } else if (setExtent === 'Sets by Stream Queue') {
    document.getElementById('setSelector').classList.add('d-none');
    document.getElementById('setStreamSelector').classList.remove('d-none');
  }
});

document.getElementById('refreshSets').addEventListener('click', () => {
  const eventId = document.getElementById('event').value;
  const apiToken = document.getElementById('apiToken').value;
  if (eventId && apiToken) {
    populateSets(eventId, apiToken);
  }
});

document.getElementById('eventName').addEventListener('change', (event) => {
  adjustFormWithEvent(event.target.value);
});

document.getElementById('round').addEventListener('change', (event) => {
  adjustFormWithRound(event.target.value);
});

document.getElementById('refreshAssets').addEventListener('click', () => {
  loadCharacterList();
});

document.getElementById('clearForm').addEventListener('click', () => {
  clearForm();
});

document.getElementById('copyPlayers').addEventListener('click', (event) => {
  copyPlayersToClipboard()
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

document.getElementById('copySet').addEventListener('click', (event) => {
  copySetToClipboard()
    .then(() => {
      const btnTarget = event.currentTarget;
      btnTarget.children.item(0).setAttribute('src', 'assets/images/svg/clipboard-check.svg');
      setTimeout(() => {
        btnTarget.children.item(0).setAttribute('src', 'assets/images/svg/clipboard-plus.svg');
      }, 1000);
    })
    .catch(err => {
      console.log(err);
      const toast = new bootstrap.Toast(document.getElementById('generalFailToast'));
      toast.show();
    });
});

document.getElementById('toggleSkins').addEventListener('click', (event) => {
  const btnTarget = event.currentTarget;
  if (btnTarget.children.item(0).getAttribute('src') == 'assets/images/svg/toggle-on.svg') {
    btnTarget.children.item(0).setAttribute('src', 'assets/images/svg/toggle-off.svg');
  } else {
    btnTarget.children.item(0).setAttribute('src', 'assets/images/svg/toggle-on.svg');
  }
});

document.getElementById('player1Name').addEventListener('input', (event) => {
  if (event.target.value in playerObj) {
    loadPlayer1Character(playerObj[event.target.value].char, playerObj[event.target.value].skin);
    if (playerObj[event.target.value].char2 && playerObj[event.target.value].skin2) {
      loadPlayer1Character2(playerObj[event.target.value].char2, playerObj[event.target.value].skin2);
    }
  }
});

document.getElementById('player2Name').addEventListener('input', (event) => {
  if (event.target.value in playerObj) {
    loadPlayer2Character(playerObj[event.target.value].char, playerObj[event.target.value].skin);
    if (playerObj[event.target.value].char2 && playerObj[event.target.value].skin2) {
      loadPlayer2Character2(playerObj[event.target.value].char2, playerObj[event.target.value].skin2);
    }
  }
});

document.getElementById('player1Char').addEventListener('change', (event) => {
  loadPlayer1Character(event.target.value);
});

document.getElementById('player2Char').addEventListener('change', (event) => {
  loadPlayer2Character(event.target.value);
});

document.getElementById('player1Char2').addEventListener('change', (event) => {
  loadPlayer1Character2(event.target.value);
});

document.getElementById('player2Char2').addEventListener('change', (event) => {
  loadPlayer2Character2(event.target.value);
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

document.getElementById('swapCommentators').addEventListener('click', () => {
  swapCommentators();
});

document.getElementById('bracketForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  let hiddenFormDivs = event.target.getElementsByClassName('d-none');
  for (let i = 0; i < hiddenFormDivs.length; i++) {
    let hiddenFormInputs = hiddenFormDivs[i].getElementsByTagName('input');
    for (let j = 0; j < hiddenFormInputs.length; j++) {
      formData.delete(hiddenFormInputs[j].name);
    }
  }

  const serializedInfo = Object.fromEntries(formData.entries());
  serializedInfo['bestOf'] = serializedInfo['bestOf'] + ' ' + serializedInfo['bestOfNum'];
  serializedInfo['player1LCheck'] = !(formData.get('player1LCheck') === null);
  serializedInfo['player2LCheck'] = !(formData.get('player2LCheck') === null);

  updatePlayerObjFromInfoObj(serializedInfo);
  if (saveFormat === 'individual') {
    serializedInfo['player1Name'] = serializedInfo['player1LCheck'] ? serializedInfo['player1Name'] + ' [L]' : serializedInfo['player1Name'];
    serializedInfo['player2Name'] = serializedInfo['player2LCheck'] ? serializedInfo['player2Name'] + ' [L]' : serializedInfo['player2Name'];

    delete serializedInfo['bestOfNum'];
    delete serializedInfo['player1LCheck'];
    delete serializedInfo['player2LCheck'];
    saveInfoObjIndividual(serializedInfo);
  } else {
    saveInfoObj(serializedInfo);
  }
});

document.getElementById('offcanvasSettings').addEventListener('show.bs.offcanvas', () => {
  let saveFormatInputs = document.getElementById('saveSettingsForm').querySelectorAll('input[name="saveFormat"]');
  for (let i = 0; i < saveFormatInputs.length; i++) {
    if (saveFormatInputs[i].value === saveFormat) {
      saveFormatInputs[i].checked = true;
    } else {
      saveFormatInputs[i].checked = false;
    }
  }

  createCustomFieldsFormFromObj(customFieldsObj);

  document.getElementById('editPlayersJSON').value = JSON.stringify(playerObj, null, 2);
});

document.getElementById('saveSettingsForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const serializedInfo = Object.fromEntries(formData.entries());

  updateSaveSettingsObj(serializedInfo);
});

document.getElementById('customFieldsForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const serializedInfo = Object.fromEntries(formData.entries());

  let customFieldsObj = {};
  for (const [key, value] of Object.entries(serializedInfo)) {
    if (key.startsWith('custom-group-')) {
      if (!(value in Object.keys(customFieldsObj))) {
        customFieldsObj[value] = {};
      }
    } else if (key.startsWith('custom-field-') && key.endsWith('-text')) {
      let groupId = key.split('-')[2];
      let fieldId = key.split('-')[3];
      let group = serializedInfo[`custom-group-${groupId}-name`];
      let field = serializedInfo[`custom-field-${groupId}-${fieldId}-name`];
      if (!Object.keys(customFieldsObj).includes(group)) {
        customFieldsObj[group] = {};
      }
      customFieldsObj[group][field] = value;
    }
  }

  updateCustomFieldsObj(customFieldsObj);
  if (saveFormat === 'individual') {
    saveCustomFieldsObjIndividual(customFieldsObj);
  } else {
    saveCustomFieldsObj(customFieldsObj);
  }
});

document.getElementById('playersForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const serializedInfo = Object.fromEntries(formData.entries());

  editPlayerObj(serializedInfo['editPlayersJSON']);
});

// Enable tooltips

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle-tooltip="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

// Set mouse bindings

Mousetrap.bind(['1'], () => { incrementP1Score() });
Mousetrap.bind(['2'], () => { incrementP2Score() });
Mousetrap.bind(['esc'], () => { resetScores() });
Mousetrap.bind(['enter'], () => { if (document.activeElement.tagName === 'BODY') document.getElementById('submitFormBtn').click(); });
Mousetrap.bind(['ctrl+s', 'meta+s'], function(e) {
  document.getElementById('submitFormBtn').click();
  return false;
});
