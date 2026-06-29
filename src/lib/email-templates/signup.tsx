import * as React from 'react'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text,
} from '@react-email/components'
import {
  SITE_NAME, SITE_URL, main, container, brandBar, eyebrow, brandName,
  h1, text, link, button, divider, footer,
} from './_brand'

interface SignupEmailProps {
  siteName?: string
  siteUrl?: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName = SITE_NAME,
  siteUrl = SITE_URL,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email to join {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandBar}>
          <Text style={eyebrow}>Multicultural Bridge Initiative</Text>
          <Text style={brandName}>{siteName}</Text>
        </Section>
        <Heading style={h1}>Confirm your email</Heading>
        <Text style={text}>
          Thank you for joining{' '}
          <Link href={siteUrl} style={link}>{siteName}</Link>
          {' '}— a community for Gospel-centered, cross-cultural reflection.
        </Text>
        <Text style={text}>
          Please confirm{' '}
          <Link href={`mailto:${recipient}`} style={link}>{recipient}</Link>
          {' '}to activate your account:
        </Text>
        <Button style={button} href={confirmationUrl}>Verify Email</Button>
        <Hr style={divider} />
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this message.
          <br />— {siteName}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
