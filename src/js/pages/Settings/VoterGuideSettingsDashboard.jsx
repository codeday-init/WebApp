import withStyles from '@mui/styles/withStyles';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import BallotActions from '../../actions/BallotActions';
import OrganizationActions from '../../actions/OrganizationActions';
import VoterGuideActions from '../../actions/VoterGuideActions';
import { renderLog } from '../../common/utils/logging';
import VoterGuideSettingsAddPositions from '../../components/Settings/VoterGuideSettingsAddPositions';
import { PageContentContainer } from '../../components/Style/pageLayoutStyles';
import AppObservableStore, { messageService } from '../../stores/AppObservableStore';
import BallotStore from '../../stores/BallotStore';
import OrganizationStore from '../../stores/OrganizationStore';
import VoterGuideStore from '../../stores/VoterGuideStore';
import VoterStore from '../../stores/VoterStore';
import { isProperlyFormattedVoterGuideWeVoteId } from '../../utils/textFormat';

class VoterGuideSettingsDashboard extends Component {
  constructor (props) {
    super(props);
    this.state = {
      getVoterGuideSettingsDashboardEditMode: '',
      linkedOrganizationWeVoteId: '',
      localGoogleCivicElectionId: 0,
      localElectionHasBeenRetrieved: {},
      localPositionListHasBeenRetrieved: {},
      voterGuide: {},
      voterGuideWeVoteId: '',
    };
  }

  componentDidMount () {
    // console.log('VoterGuideSettingsDashboard componentDidMount');
    const { match: { params } } = this.props;
    // if (params.edit_mode) {  // We are going to ignore the incoming edit_mode
    this.onAppObservableStoreChange();
    // Get Voter Guide information
    // const { match: { params } } = this.props;
    // console.log('params.voter_guide_we_vote_id:', params.voter_guide_we_vote_id);
    // let voterGuideFound = false;
    if (params.voter_guide_we_vote_id && isProperlyFormattedVoterGuideWeVoteId(params.voter_guide_we_vote_id)) {
      this.setState({
        voterGuideWeVoteId: params.voter_guide_we_vote_id,
      });
      const voterGuide = VoterGuideStore.getVoterGuideByVoterGuideId(params.voter_guide_we_vote_id);
      if (voterGuide && voterGuide.we_vote_id) {
        this.setState({
          localGoogleCivicElectionId: voterGuide.google_civic_election_id,
          voterGuide,
        });
        // voterGuideFound = true;
        const currentElectionMatchesBallotLoaded = voterGuide.google_civic_election_id && BallotStore.currentBallotGoogleCivicElectionId && voterGuide.google_civic_election_id === BallotStore.currentBallotGoogleCivicElectionId;
        // console.log('BallotStore.currentBallotGoogleCivicElectionId:', BallotStore.currentBallotGoogleCivicElectionId);
        if (!currentElectionMatchesBallotLoaded) {
          // console.log('VoterGuideSettingsDashboard componentDidMount retrieving ballot for: ', voterGuide.google_civic_election_id);
          BallotActions.voterBallotItemsRetrieve(voterGuide.google_civic_election_id, '', '');
        } else {
          // console.log('VoterGuideSettingsDashboard componentDidMount NOT retrieving ballot for: ', voterGuide.google_civic_election_id);
        }
      }
    }
    this.onBallotStoreChange();
    this.onVoterStoreChange();
    this.onOrganizationStoreChange();
    this.appStateSubscription = messageService.getMessage().subscribe(() => this.onAppObservableStoreChange());
    this.ballotStoreListener = BallotStore.addListener(this.onBallotStoreChange.bind(this));
    this.organizationStoreListener = OrganizationStore.addListener(this.onOrganizationStoreChange.bind(this));
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));
    this.voterStoreListener = VoterStore.addListener(this.onVoterStoreChange.bind(this));
    window.scrollTo(0, 0);
  }

  // eslint-disable-next-line camelcase,react/sort-comp
  UNSAFE_componentWillReceiveProps (nextProps) {
    // console.log('VoterGuideSettingsDashboard componentDidMount');
    const { match: { params: nextParams } } = nextProps;
    this.onAppObservableStoreChange();
    // console.log('nextParams.voter_guide_we_vote_id:', nextParams.voter_guide_we_vote_id);
    if (nextParams.voter_guide_we_vote_id && isProperlyFormattedVoterGuideWeVoteId(nextParams.voter_guide_we_vote_id)) {
      const voterGuide = VoterGuideStore.getVoterGuideByVoterGuideId(nextParams.voter_guide_we_vote_id);
      this.setState({
        localGoogleCivicElectionId: voterGuide.google_civic_election_id,
        voterGuide,
        voterGuideWeVoteId: nextParams.voter_guide_we_vote_id,
      });
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.getVoterGuideSettingsDashboardEditMode !== nextState.getVoterGuideSettingsDashboardEditMode) {
      // console.log('this.state.getVoterGuideSettingsDashboardEditMode: ', this.state.getVoterGuideSettingsDashboardEditMode, ', nextState.getVoterGuideSettingsDashboardEditMode: ', nextState.getVoterGuideSettingsDashboardEditMode);
      return true;
    }
    if (this.state.linkedOrganizationWeVoteId !== nextState.linkedOrganizationWeVoteId) {
      // console.log('this.state.linkedOrganizationWeVoteId: ', this.state.linkedOrganizationWeVoteId, ', nextState.linkedOrganizationWeVoteId: ', nextState.linkedOrganizationWeVoteId);
      return true;
    }
    if (this.state.localGoogleCivicElectionId !== nextState.localGoogleCivicElectionId) {
      // console.log('this.state.localGoogleCivicElectionId: ', this.state.localGoogleCivicElectionId, ', nextState.localGoogleCivicElectionId: ', nextState.localGoogleCivicElectionId);
      return true;
    }
    if (this.state.voterGuideWeVoteId !== nextState.voterGuideWeVoteId) {
      // console.log('this.state.voterGuideWeVoteId: ', this.state.voterGuideWeVoteId, ', nextState.voterGuideWeVoteId: ', nextState.voterGuideWeVoteId);
      return true;
    }
    return false;
  }

  componentWillUnmount () {
    this.appStateSubscription.unsubscribe();
    this.ballotStoreListener.remove();
    this.organizationStoreListener.remove();
    this.voterGuideStoreListener.remove();
    this.voterStoreListener.remove();
  }

  onAppObservableStoreChange () {
    this.setState({
      getVoterGuideSettingsDashboardEditMode: AppObservableStore.getVoterGuideSettingsDashboardEditMode(),
    });
  }

  onBallotStoreChange () {
    // const incomingBallotItemList = BallotStore.ballot;
    // console.log('VoterGuideSettingsAddPositions, onBallotStoreChange incomingBallotItemList:', incomingBallotItemList);
    this.setState({
      // ballotItemList: incomingBallotItemList,
      // filteredBallotItemList: incomingBallotItemList,
    });
  }

  onOrganizationStoreChange () {
    // console.log('onOrganizationStoreChange, linkedOrganizationWeVoteId: ', this.state.linkedOrganizationWeVoteId);
    const { linkedOrganizationWeVoteId, localPositionListHasBeenRetrieved, voterGuide } = this.state;
    const organization = OrganizationStore.getOrganizationByWeVoteId(linkedOrganizationWeVoteId);
    this.setState({
      // positionListForOneElection: organization.position_list_for_one_election,
      // filteredPositionListForOneElection: organization.position_list_for_one_election,
    });
    // Positions for this organization, for this election
    // console.log('onOrganizationStoreChange, voterGuide: ', voterGuide, ', organization:', organization);
    if (voterGuide && voterGuide.google_civic_election_id && organization && organization.organization_we_vote_id) {
      const doNotRetrievePositionList = localPositionListHasBeenRetrieved[voterGuide.google_civic_election_id] || OrganizationStore.positionListForOpinionMakerHasBeenRetrievedOnce(voterGuide.google_civic_election_id, organization.organization_we_vote_id);
      if (!doNotRetrievePositionList) {
        // console.log('CALLING positionListForOpinionMaker, VoterGuideSettingsDashboard');
        localPositionListHasBeenRetrieved[voterGuide.google_civic_election_id] = true;
        this.setState({
          localPositionListHasBeenRetrieved,
        });
        OrganizationActions.positionListForOpinionMaker(organization.organization_we_vote_id, false, true, voterGuide.google_civic_election_id);
        OrganizationActions.positionListForOpinionMaker(organization.organization_we_vote_id, true, false, voterGuide.google_civic_election_id);
      }
    }
  }

  onVoterGuideStoreChange () {
    const { localElectionHasBeenRetrieved } = this.state;
    // console.log('VoterGuideSettingsDashboard onVoterGuideStoreChange, this.state.voterGuideWeVoteId', this.state.voterGuideWeVoteId);
    if (this.state.voterGuideWeVoteId && isProperlyFormattedVoterGuideWeVoteId(this.state.voterGuideWeVoteId)) {
      const voterGuide = VoterGuideStore.getVoterGuideByVoterGuideId(this.state.voterGuideWeVoteId);
      if (voterGuide && voterGuide.we_vote_id) {
        // console.log('VoterGuideSettingsDashboard onVoterGuideStoreChange voterGuide FOUND');
        this.setState({
          localGoogleCivicElectionId: voterGuide.google_civic_election_id,
          voterGuide,
        });
        const currentElectionMatchesBallotLoaded = voterGuide.google_civic_election_id && BallotStore.currentBallotGoogleCivicElectionId && voterGuide.google_civic_election_id === BallotStore.currentBallotGoogleCivicElectionId;
        const doNotRetrieveBallotItems = localElectionHasBeenRetrieved[voterGuide.google_civic_election_id] || currentElectionMatchesBallotLoaded;
        // console.log('BallotStore.currentBallotGoogleCivicElectionId:', BallotStore.currentBallotGoogleCivicElectionId);
        if (!doNotRetrieveBallotItems) {
          // console.log('VoterGuideSettingsDashboard onVoterGuideStoreChange retrieving ballot for: ', voterGuide.google_civic_election_id);
          BallotActions.voterBallotItemsRetrieve(voterGuide.google_civic_election_id, '', '');
        } else {
          // console.log('VoterGuideSettingsDashboard onVoterGuideStoreChange NOT retrieving ballot for: ', voterGuide.google_civic_election_id);
        }
      }
    }
  }

  onVoterStoreChange () {
    // Get Voter and Voter's Organization
    const voter = VoterStore.getVoter();
    let linkedOrganizationWeVoteId;
    if (voter && voter.we_vote_id) {
      linkedOrganizationWeVoteId = voter.linked_organization_we_vote_id;
      if (linkedOrganizationWeVoteId) {
        this.setState({
          linkedOrganizationWeVoteId,
        });
        let voterGuideNeeded = true;
        if (this.state.voterGuide && this.state.voterGuide.we_vote_id) {
          voterGuideNeeded = false;
        }
        if (voterGuideNeeded) {
          // console.log('VoterGuideSettingsDashboard onVoterStoreChange calling VoterGuideActions.voterGuidesRetrieve');
          VoterGuideActions.voterGuidesRetrieve(linkedOrganizationWeVoteId);
        }
        const organization = OrganizationStore.getOrganizationByWeVoteId(linkedOrganizationWeVoteId);
        if (organization && organization.organization_we_vote_id) {
          this.onOrganizationStoreChange();
        } else {
          OrganizationActions.organizationRetrieve(linkedOrganizationWeVoteId);
          // if (voterGuide && voterGuide.google_civic_election_id) {
          // OrganizationActions.positionListForOpinionMaker(linkedOrganizationWeVoteId, true, false); // , voterGuide.google_civic_election_id
          // }
        }
      }
    }
    // console.log('onVoterStoreChange, linkedOrganizationWeVoteId: ', linkedOrganizationWeVoteId);
  }

  render () {
    renderLog('VoterGuideSettingsDashboard');  // Set LOG_RENDER_EVENTS to log all renders
    const { getVoterGuideSettingsDashboardEditMode, voterGuideWeVoteId } = this.state;
    // console.log('VoterGuideSettingsDashboard, getVoterGuideSettingsDashboardEditMode:', getVoterGuideSettingsDashboardEditMode, ', voterGuideWeVoteId:', voterGuideWeVoteId);

    return (
      <PageContentContainer>
        <EndorsementListBody>
          {/* Body of page "/vg/wvYYvgYY/settings/positions" */}
          <VoterGuideSettingsAddPositions
            addNewPositionsMode={getVoterGuideSettingsDashboardEditMode !== 'positions'}
            voterGuideWeVoteId={voterGuideWeVoteId}
          />
        </EndorsementListBody>
      </PageContentContainer>
    );
  }
}
VoterGuideSettingsDashboard.propTypes = {
  match: PropTypes.object,
};

const styles = () => ({
  formControl: {
    width: '100%',
  },
});

const EndorsementListBody = styled('div')`
`;

export default withStyles(styles)(VoterGuideSettingsDashboard);
