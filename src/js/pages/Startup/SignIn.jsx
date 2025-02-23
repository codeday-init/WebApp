import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import SignInOptionsPanel from '../../components/SignIn/SignInOptionsPanel';
import AppObservableStore from '../../stores/AppObservableStore';
import VoterStore from '../../stores/VoterStore';

// React functional component example
export default function SignIn (props) {
  const { displayState } = props;

  renderLog('SignIn functional component');
  if (displayState !== 1) {
    return '';
  }
  AppObservableStore.setGetStartedMode('startup');
  try {
    const voter = VoterStore.getVoter();
    if (voter && voter.is_signed_in) {
      return <div style={{ padding: '20px', fontWeight: 600 }}>You are already signed in!</div>;
    } else {
      return (
        <SignInOptionsWrapper>
          <SignInOptionsPanel
            inModal={false}
            closeSignInModal={() => console.log('do we need a close callback here?')}
          />
        </SignInOptionsWrapper>
      );
    }
  } catch (e) {
    console.log('error in SignIn ', e);
    return '';
  }
}
SignIn.propTypes = {
  displayState: PropTypes.number.isRequired,
};

const SignInOptionsWrapper = styled('div')`
  padding-top: 25px
`;
