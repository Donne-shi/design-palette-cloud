import * as React from 'react'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text,
} from '@react-email/components'
import {
  SITE_NAME, SITE_URL, main, container, brandBar, eyebrow, brandName,
  h1, text, link, button, divider, footer,
} from './_brand'

interface InviteEmailProps {
  siteName?: string
  siteUrl?: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName = SITE_NAME,
  siteUrl = SITE_URL,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're invited to join {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandBar}>
          <Text style={eyebrow}>Multicultural Bridge Initiative</Text>
          <Text style={brandName}>{siteName}</Text>
        </Section>
        <Heading style={h1}>You're invited</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}><strong>{siteName}</strong></Link>
          {' '}— a space for cross-cultural, Gospel-centered conversation.
          Accept the invitation below to create your account.
        </Text>
        <Button style={button} href={confirmationUrl}>Accept Invitation</Button>
        <Hr style={divider} />
        <Text style={footer}>
          If you weren't expecting this, you can safely ignore this message.
          <br />— {siteName}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
