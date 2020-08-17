import React from 'react';
import './App.css';

import FamilyTree from './components/familyTree';

// import Network from './Network';

import { cloneDeep } from 'lodash';

export const DUPLICATE_KEY = 'duplicate';

const HOST = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '';
const INIT_USER = process.env.NODE_ENV === 'development' ? 'ohmyseon' : '';

function App() {
  const [username, setUsername] = React.useState(INIT_USER);

  const [user, setUser] = React.useState();

  const [store, setStore] = React.useState([]);

  const [status, setStatus] = React.useState('');

  const [userDataNodes, setUserDataNodes] = React.useState([]);
  const [userDataLinks, setUserDataLinks] = React.useState([]);

  function submit(e) {
    e.preventDefault();
    getInfo(username);
  }

  function handle(res) {
    if (!res.ok) {
      res.json().then(r => { setStatus(r.detail); });
      throw new Error('Erroneous api response');
    }
    else {
      return res.json();
    }
  }

  function getInfo(username) {
    setStatus('Loading...');

    fetch(`${HOST}/api/info/${username}`)
      .then(handle)
      .then((data) => {
        setStore(store => store.concat([data.pk]));

        return data;
      })
      .then((data) => {
        setUser(data);

        setUserDataNodes(nodes => nodes.concat([data]));

        getChildren(data.pk, [], { oldStore: [] });
      })
      .catch(e => setStatus(String(e)));
  }

  function getChildren(user_id, path, { oldStore, ref }) {
    let newStore;

    setStatus('Loading...');

    fetch(`${HOST}/api/suggested/${user_id}`)
      .then(handle)
      .then((children) => {
        if (!oldStore) {
          oldStore = store;
          newStore = [];
        } else {
          newStore = [user_id];
        }

        const newUsers = [];
        const newLinks = [];

        // children = children.filter((i) => !oldStore.includes(i.pk));

        for (let index = 0; index < children.length; index++) {
          const element = children[index];

          // console.log(oldStore)

          if (oldStore.includes(element.pk)) {
            element[DUPLICATE_KEY] = true;
          }

          if (path) {
            const newPath = cloneDeep(path);
            newPath.push(index);
            element.path = newPath;
          } else {
            element.path = [index];
          }

          if (userDataNodes.findIndex(i => i.pk === element.pk) < 0) {
            newUsers.push(element);
            newLinks.push({
              source: user_id,
              target: element.pk
            });
          }

          newStore.push(element.pk);
        }

        // setUserData(oldUsers => {
        //   const users = cloneDeep(oldUsers);
        //   const ix = users.findIndex(i => i.pk === user_id);
        //   users[ix].children = children.map(i => i.username);
        //   return users.concat(newUsers);
        // });


        setUserDataNodes(nodes => nodes.concat(newUsers));
        setUserDataLinks(links => links.concat(newLinks));

        setStore(oldStore.concat(newStore));

        setUser(oldUser => {
          let newUser;

          if (oldUser) {
            newUser = cloneDeep(oldUser);
          } else {
            newUser.children = children;
          }

          updateChildren(newUser, children, path);

          return newUser;
        });

        setStatus('');

        if (ref) {
          ref.current.scrollIntoView({ behavior: "smooth", block: "start", inline: "center" });
        }
      })
      .catch(e => setStatus(String(e)));
  }

  function updateChildren(user, newChildren, path, position = 0) {
    if (!path) {
      return user;
    }

    const index = path[position];

    if (position >= path.length) {
      user.children = newChildren;
    } else {
      user.children[index] = updateChildren(user.children[index], newChildren, path, position + 1);
    }

    return user;
  }


  return (
    <div className="App">
      <Status status={status} />

      <div className="card">
        <div className="card-body">
          <Form {...{ username, setUsername, submit }} />
        </div>
        {user && user.children ?
          <div className="card-footer">
            Click on the avatar to load suggestions for that user.
            New suggestions are automatically filtered against what is currently displayed, so that all
            profiles on the screen are unique. Clicking on the avatar again will hide all of its children.
           </div> : null
        }

      </div>

      <div className="chart" id="tree">
        <FamilyTree members={[user]} update={getChildren} />
      </div>

      {/* <Network data={{ nodes: userDataNodes, links: userDataLinks }} update={getChildren} /> */}
    </div>
  );
}

function Form({ username, setUsername, submit }) {
  return (
    <form onSubmit={submit}>
      <div className="input-group search" id="search">
        <input
          type="text"
          id="name"
          name="name"
          className="form-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required={true}
          placeholder="Enter Instagram name to load suggestions"
        />
        <button type="submit" className="btn btn-primary input-group-btn">
          Submit
        </button>
      </div>
    </form>
  );
}

function Status({ status }) {
  if (!status) {
    return null;
  }

  return (
    <div className="status-wrapper">
      <div className="status">
        {status}
      </div>
    </div>
  );
}

export default App;
