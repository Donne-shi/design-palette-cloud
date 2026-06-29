import * as React from 'react'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import {
  SITE_NAME, main, container, brandBar, eyebrow, brandName,
  h1, text, button, divider, footer,
} from './_brand'

interface RecoveryEmailProps {
  siteName?: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName = SITE_NAME,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandBar}>
          <Text style={eyebrow}>Multicultural Bridge Initiative</Text>
          <Text style={brandName}>{siteName}</Text>
        </Section>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset the password for your {siteName} account.
          Click the button below to choose a new one.
        </Text>
        <Button style={button} href={confirmationUrl}>Reset Password</Button>
        <Hr style={divider} />
        <Text style={footer}>
          If you didn't request this, your password will not change — you can safely ignore this message.
          <br />— {siteName}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
