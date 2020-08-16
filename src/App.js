import React from 'react';
import './App.css';

import FamilyTree from './components/familyTree';

// import Network from './Network'

import { cloneDeep } from 'lodash'

import 'spectre.css/dist/spectre.min.css';

export const DUPLICATE_KEY = 'duplicate'


function App() {
  const [username, setUsername] = React.useState('ohmyseon')

  const [user, setUser] = React.useState({})

  const [store, setStore] = React.useState([]);

  const [status, setStatus] = React.useState('')

  const [users, setUsers] = React.useState([])

  function handleClick() {

    getInfo(username)

  }

  function handle(res) {
    if (!res.ok) {
      res.text().then(text => { setStatus(text) })
    }
    else {
      return res.json();
    }
  }

  function getInfo(username) {
    setStatus('Loading...')

    fetch(`http://localhost:8000/info/${username}`)
      .then(handle)
      .then((data) => {

        setStore(store => store.concat([data.pk]))

        return data
      })
      .then((data) => {
        setUser(data)

        setUsers(users => users.concat([data]))

        getChildren(data.pk, [], [])
      })
      .catch(console.log)
  }

  function getChildren(user_id, path, oldStore) {
    const newStore = []

    setStatus('Loading...')

    fetch(`http://localhost:8000/suggested/${user_id}`)
      .then(handle)
      .then((children) => {
        newStore.push(children.pk);

        if (!oldStore) {
          oldStore = store
        }

        const newUsers = []

        // children = children.filter((i) => !oldStore.includes(i.pk));

        for (let index = 0; index < children.length; index++) {
          const element = children[index];

          if (oldStore.includes(element.pk)) {
            element[DUPLICATE_KEY] = true
          }

          if (path) {
            const newPath = cloneDeep(path)
            newPath.push(index)
            element.path = newPath
          } else {
            element.path = [index]
          }

          if (users.findIndex(i => i.pk === element.pk) < 0) {
            newUsers.push(element)
          }

          newStore.push(element.pk);
        }

        setUsers(oldUsers => {
          const users = cloneDeep(oldUsers)
          const ix = users.findIndex(i => i.pk === user_id)
          users[ix].children = children.map(i => i.username)
          return users.concat(newUsers)
        })

        setStore(oldStore.concat(newStore))

        setUser(oldTree => {
          let newTree

          if (Object.keys(oldTree).length) {
            newTree = cloneDeep(oldTree)
          } else {
            newTree.children = children
          }

          updateChildren(newTree, children, path)

          console.log(newTree)

          return newTree
        })

        setStatus('')
      })
      .catch(console.log)
  }

  function updateChildren(user, newChildren, path, position = 0) {
    const index = path[position]

    if (position >= path.length) {
      user.children = newChildren
    } else {
      user.children[index] = updateChildren(user.children[index], newChildren, path, position + 1)
    }

    return user
  }

  return (
    <div className="App">
      <Status status={status} />
      <div className="input-group search">
        <input
          type="text"
          id="name"
          name="name"
          className="form-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="button" className="btn btn-primary input-group-btn" onClick={handleClick}>
          Submit
        </button>
      </div>

      <div className="chart" id="tree">
        <FamilyTree members={[user]} update={getChildren} />
      </div>

      {/* <Network data={users} update={getChildren} /> */}
    </div>
  );
}

function Status({ status }) {
  if (!status) {
    return null
  }

  return (
    <div className="status-wrapper">
      <div className="status">
        {status}
      </div>
    </div>
  )
}

export default App;
