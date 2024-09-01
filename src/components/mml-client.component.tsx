import { EditableNetworkedDOM, NetworkedDOM } from '@mml-io/networked-dom-document';
import { MMLScene } from 'mml-web';
import { MMLWebRunnerClient } from 'mml-web-runner';
import * as React from 'react';
import * as THREE from 'three';
import { useEffect, useState } from 'react';

import MMLView from './mml-view.component';
import { getIframeTargetWindow } from './iframe-target';

export const MMLClient = React.memo(function BaseClient(props: {
  document: NetworkedDOM | EditableNetworkedDOM;
  clientId: number;
  children?: React.ReactNode;
  baseScene?: boolean;
}) {
  const [clientState, setClientState] = useState<{
    client: MMLWebRunnerClient;
    scene: MMLScene;
    children?: React.ReactNode;
  } | null>(null);
  const elementRef = React.useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = React.useState(false);

  useEffect(() => {
    let disposed = false;
    let runnerClient: MMLWebRunnerClient | null = null;
    let mmlScene: MMLScene | null = null;
    getIframeTargetWindow()?.then((wrapper: any) => {
      if (disposed) {
        return;
      }
      mmlScene = new MMLScene();
      // if (props.baseScene) {
        const pointLight = new THREE.PointLight(0xffffff, 500, 100);
        pointLight.position.set(-1, 10, 15);
        pointLight.castShadow = false;
        pointLight.shadow.bias = -0.001;
        pointLight.shadow.normalBias = 0.01;
        // const plane = new THREE.Mesh(
        //   new THREE.PlaneGeometry(20, 20),
        //   new THREE.MeshStandardMaterial({ color: 0xffffff }),
        // );
        // plane.receiveShadow = true;
        // plane.rotation.x = -Math.PI / 2;
        // mmlScene.getThreeScene().add(plane);
        mmlScene.getThreeScene().add(pointLight);
      // }
      runnerClient = new MMLWebRunnerClient(wrapper.iframeWindow, wrapper.iframeBody, mmlScene);
      runnerClient.connect(props.document);
      setClientState({ client: runnerClient, scene: mmlScene });
    });

    return () => {
      disposed = true;
      if (runnerClient) {
        runnerClient.dispose();
      }
      if (mmlScene) {
        mmlScene.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (elementRef.current && clientState && loaded) {
      elementRef.current.appendChild(clientState.scene.element);
    }
  }, [elementRef, clientState, loaded]);

  if (!clientState) {
    return null;
  }

  setTimeout(() => {
    clientState?.scene.fitContainer();
  }, 1);

  return (
    <MMLView onLoad={() => setLoaded(true)} elementRef={elementRef}>
      {props.children}
    </MMLView>
  );
});