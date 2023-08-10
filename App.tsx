import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Button,
  Text,
  Alert,
  useColorScheme,
  NativeEventEmitter,
} from 'react-native';

import ZoomUs, {ZoomEmitter, ZoomUsVideoView} from 'react-native-zoom-us';
import {type NativeLayoutUnit} from 'react-native-zoom-us/native';


type CustomViewerProps = {
  leaveMeeting: () => void;
};

const CustomViewer = ({leaveMeeting}: CustomViewerProps) => {
  const [showScreenShare, setShowScreenShare] = useState(false);

  const activeConfig: NativeLayoutUnit = {
    kind: 'active',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  };

  const activeShareConfig: NativeLayoutUnit = {
    kind: 'active-share',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Button onPress={leaveMeeting} title="Leave meeting" />
      <Button onPress={() => ZoomUs.startShareScreen()} title="Share screen" />
      <Button
        onPress={() => setShowScreenShare(!showScreenShare)}
        title={!showScreenShare ? 'Show screen' : 'Show video'}
      />
      <ZoomUsVideoView
        style={styles.customViewer}
        layout={[
          showScreenShare ? activeShareConfig : activeConfig,
          // Selfcamera preview
          {
            kind: 'preview',

            x: 0.73,
            y: 0.73,
            width: 0.25,
            height: 0.2,

            border: true,

            showUsername: false,

            showAudioOff: true,

            background: '#ccc',
          },
        ]}
      />
    </View>
  );
};

// 3. `TODO` Enable custom view (android only)
const enableCustomizedMeetingUI = false;

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMeetingOngoing, setIsMeetingOngoing] = useState(false);

  console.log({isDarkMode});

  useEffect(() => {
    (async () => {
      try {
        const initializeResult = await ZoomUs.initialize(
          {
            clientKey: 'yT3iqClKSbq1mk95ZFI3Hw', 
            clientSecret: 'HdZhgOYqXbu8xAZ2j0oiLF7D144XJeJ4'},
          {
              language: "en",
              enableCustomizedMeetingUI,
            }
        );

        console.log({initializeResult});

        setIsInitialized(true);
      } catch (e) {
        Alert.alert('Error', 'Could not execute initialize');
        console.error('ERR', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const zoomEmitter = new NativeEventEmitter(ZoomEmitter);
    const eventListener = zoomEmitter.addListener(
      'MeetingEvent',
      ({event, status, ...params}) => {
        console.log({event, status, params}); //e.g.  "endedByHost"

        if (status === 'MEETING_STATUS_CONNECTING') {
          setIsMeetingOngoing(true);
        }

        if (status === 'MEETING_STATUS_DISCONNECTING') {
          // Once it is set it is good to render
          setIsMeetingOngoing(false);
        }
      },
    );

    return () => eventListener.remove();
  }, [isInitialized]);

  const startMeeting = async () => {
    try {
      const startMeetingResult = await ZoomUs.startMeeting({
        userName: 'Zelhus',
        meetingNumber: '93955536769',
        zoomAccessToken: "eyJ0eXAiOiJKV1QiLCJzdiI6IjAwMDAwMSIsInptX3NrbSI6InptX28ybSIsImFsZyI6IkhTMjU2In0.eyJhdWQiOiJjbGllbnRzbSIsInVpZCI6IjU0c0MzYW9zUXJxVE0zMUV6OFNOVXciLCJpc3MiOiJ3ZWIiLCJzayI6IjAiLCJzdHkiOjEwMCwid2NkIjoiYXcxIiwiY2x0IjowLCJtbnVtIjoiOTM5NTU1MzY3NjkiLCJleHAiOjE2OTE2NjYyOTMsImlhdCI6MTY5MTY1OTA5MywiYWlkIjoiLWVzUUltdXVTUFNGam9udERiT082USIsImNpZCI6IiJ9.ZswFQh9SOlKrLVKqidG3DnHLvftOtGVyNZCSAF8ZyN8",
        noMeetingErrorMessage: true, 
      });

      console.log({startMeetingResult});
    } catch (e) {
      Alert.alert('Error', 'Could not execute startMeeting');
      console.error('ERR', e);
    }
  };

  const joinMeeting = async () => {
    try {
      const joinMeetingResult = await ZoomUs.joinMeeting({
        autoConnectAudio: true,
        userName: `Raman Gupta`,
        meetingNumber: '93955536769',
        password: 'c2JJSTVFSUlHRm9JN1FRWWhVUGludz09',
        noMeetingErrorMessage: true, 
      });

      console.log({joinMeetingResult});
    } catch (e) {
      Alert.alert('Error', 'Could not execute joinMeeting');
      console.error('ERR', e);
    }
  };

  const leaveMeeting = async () => {
    try {
      const leaveMeetingResult = await ZoomUs.leaveMeeting();

      console.log({leaveMeetingResult});
    } catch (e) {
      Alert.alert('Error', 'Could not execute leaveMeeting');
      console.error('ERR', e);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Button
          onPress={() => startMeeting()}
          title="Start meeting"
          disabled={!isInitialized}
        />
        <Text>-------</Text>
        <Button
          onPress={() => joinMeeting()}
          title="Join meeting"
          disabled={!isInitialized}
        />
      </View>
      {enableCustomizedMeetingUI && isMeetingOngoing && (
        <CustomViewer leaveMeeting={leaveMeeting} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  customViewer: {
    width: '100%',
    flex: 1,
  },
});

export default App;
