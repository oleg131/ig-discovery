import React from 'react';
import styled from 'styled-components';

import { cloneDeep } from 'lodash'

const StyledWrapper = styled.div`
  // margin: 10px;
  // display: flex;
  // flex-direction: column;
  // align-items: center;
  // border: 1px solid black
  min-width: 100px;
`


const Member = ({ member, update, setShowChildren }) => {
  if (!Object.keys(member).length) {
    return <div></div>
  }

  // const [name, avatar] = member

  const name = member.username
  const avatar = member.profile_pic_url

  function onClick() {
    if (!member.children) {
      update(member.pk, member.path)
    } else {
      setShowChildren(prevState => !prevState)
    }

  }

  return (
    <StyledWrapper>
      <figure className="figure">
        <figure className="avatar avatar-xl pointer"><img src={avatar} alt="" onClick={onClick} /></figure>
        <figcaption className="figure-caption text-center">
          <a href={`https://www.instagram.com/${name}/`} target="_blank" rel="noopener noreferrer">{name}</a>
        </figcaption>
      </figure>
    </StyledWrapper>
  )
}

export default Member;