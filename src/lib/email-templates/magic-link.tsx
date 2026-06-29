import * as React from 'react'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import {
  SITE_NAME, main, container, brandBar, eyebrow, brandName,
  h1, text, button, divider, footer,
} from './_brand'

interface MagicLinkEmailProps {
  siteName?: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName = SITE_NAME,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your sign-in link for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandBar}>
          <Text style={eyebrow}>Multicultural Bridge Initiative</Text>
          <Text style={brandName}>{siteName}</Text>
        </Section>
        <Heading style={h1}>Your sign-in link</Heading>
        <Text style={text}>
          Click below to sign in to {siteName}. This link expires shortly and can only be used once.
        </Text>
        <Button style={button} href={confirmationUrl}>Sign In</Button>
        <Hr style={divider} />
        <Text style={footer}>
          If you didn't request this link, you can safely ignore this message.
          <br />— {siteName}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
