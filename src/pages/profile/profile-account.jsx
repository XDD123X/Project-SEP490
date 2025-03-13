import React from 'react'
import ProfileForm from './profileForm'
import ContentSection from './../../components/profile/Content-Section';

export default function ProfileAccount() {
  return (
    <ContentSection
      title='Profile'
      desc='Account Informations.'
    >
      <ProfileForm />
    </ContentSection>
  )
}
