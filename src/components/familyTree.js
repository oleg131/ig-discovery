import React from 'react';
import Member from './member';

import { chunk } from 'lodash';

import { DUPLICATE_KEY } from '../App';

const ROW_SIZE = 8;

export default function FamilyTree({ members, update, level = 0 }) {

  if (!members.every(Boolean)) {
    return null;
  }

  members = members.filter(m => !m[DUPLICATE_KEY]);

  const chunks = chunk(members, ROW_SIZE);

  return (
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
  );
}

function MemberTree({ member, update }) {
  const [showChildren, setShowChildren] = React.useState(true);

  function hasChildren(member) {
    return member.children && member.children.length && showChildren;
  }

  // Don't show top level member if there are no children (still loading)
  if (!member.path && !hasChildren(member)) {
    return null;
  }

  return (
    <div className={"column" + (hasChildren(member) ? " panel" : "")}>
      <Member member={member} update={update} setShowChildren={setShowChildren} />
      {hasChildren(member) && <FamilyTree members={member.children} update={update} />}
    </div>
  );
}