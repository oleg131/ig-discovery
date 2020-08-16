import React from 'react';
import Member from './member';

import { chunk } from 'lodash'

import { DUPLICATE_KEY } from '../App'

const CHUNK_SIZE = 8



export default function FamilyTree({ members, update, level = 0 }) {

  members = members.filter(m => !m[DUPLICATE_KEY])

  const chunks = chunk(members, CHUNK_SIZE)

  return (
    // <StyledWrapper level={level}>

    <div className="container">
      {
        chunks.map((row, i) => (
          <div className="columns" key={`row-${i}`}>
            {
              row.map((member, j) => (
                <MemberTree member={member} update={update} key={`column-${j}`} />
              ))
            }
          </div>
        ))
      }

    </div>
    // </StyledWrapper>
  )
}

function MemberTree({ member, update }) {
  const [showChildren, setShowChildren] = React.useState(true)

  function hasChildren(member) {
    return member.children && member.children.length && showChildren;
  }

  return (
    <div className={"column" + (hasChildren(member) ? " panel" : "")}>
      {/* <div className="column"> */}
      <Member member={member} update={update} setShowChildren={setShowChildren} />
      {hasChildren(member) && <FamilyTree members={member.children} update={update} />}
      {/* </div> */}

    </div>
  )
}