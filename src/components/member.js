import React from 'react';



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
    <div className="member">
      <figure className="figure">
        <figure className="avatar avatar-xl pointer"><img src={avatar} alt="" onClick={onClick} /></figure>
        <figcaption className="figure-caption text-center">
          <a href={`https://www.instagram.com/${name}/`} target="_blank" rel="noopener noreferrer">{name}</a>
        </figcaption>
      </figure>
    </div>
  )
}

export default Member;