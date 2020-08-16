import React from 'react';
import './App.css';

import FamilyTree from './components/familyTree';

// import Network from './Network'

import { cloneDeep } from 'lodash'

export const DUPLICATE_KEY = 'duplicate'

const HOST = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : ''
const INIT_USER = process.env.NODE_ENV === 'development' ? 'ohmyseon' : ''

function App() {
  const [username, setUsername] = React.useState(INIT_USER)

  const [user, setUser] = React.useState()

  const [store, setStore] = React.useState([]);

  const [status, setStatus] = React.useState('')

  const [users, setUsers] = React.useState([])

  function submit(e) {
    e.preventDefault()
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

    fetch(`${HOST}/api/info/${username}`)
      .then(handle)
      .then((data) => {
        setStore(store => store.concat([data.pk]))

        return data
      })
      .then((data) => {
        setUser(data)

        setUsers(users => users.concat([data]))

        getChildren(data.pk, [], { oldStore: [] })
      })
      .catch(e => setStatus(String(e)))
  }

  function getChildren(user_id, path, { oldStore, ref }) {
    let newStore

    setStatus('Loading...')

    fetch(`${HOST}/api/suggested/${user_id}`)
      .then(handle)
      .then((children) => {
        if (!oldStore) {
          oldStore = store
          newStore = []
        } else {
          newStore = [user_id]
        }

        const newUsers = []

        // children = children.filter((i) => !oldStore.includes(i.pk));

        for (let index = 0; index < children.length; index++) {
          const element = children[index];

          // console.log(oldStore)

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

          return newTree
        })

        setStatus('')

        if (ref) {
          ref.current.scrollIntoView({ behavior: "smooth", block: "start", inline: "center" });
        }
      })
      .catch(e => setStatus(String(e)))
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

      <div className="card">
        <div className="card-header">
          <div className="card-subtitle text-gray">Enter Instagram name to load suggestions</div>
        </div>
        <div className="card-body">
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
              />
              <button type="submit" className="btn btn-primary input-group-btn">
                Submit
             </button>
            </div>
          </form>
        </div>
        {user ?
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
