import * as React from 'react'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import {
  SITE_NAME, main, container, brandBar, eyebrow, brandName,
  h1, text, codeStyle, divider, footer,
} from './_brand'

interface ReauthenticationEmailProps {
  siteName?: string
  token: string
}

export const ReauthenticationEmail = ({
  siteName = SITE_NAME,
  token,
}: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {siteName} verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandBar}>
          <Text style={eyebrow}>Multicultural Bridge Initiative</Text>
          <Text style={brandName}>{siteName}</Text>
        </Section>
        <Heading style={h1}>Confirm reauthentication</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Hr style={divider} />
        <Text style={footer}>
          This code expires shortly. If you didn't request this, you can safely ignore this message.
          <br />— {siteName}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
