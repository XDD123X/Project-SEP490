import React from 'react'
import ProfileForm from './profileForm'
import ContentSection from './../../components/profile/Content-Section';

export default function ProfileAccount() {
  return (
    <ContentSection
      title='Profile'
      desc='This is how others will see you on the site.'
    >
      <ProfileForm />
    </ContentSection>
  )
}
