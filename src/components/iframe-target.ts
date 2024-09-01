import { IframeWrapper, IframeWrapperResult, registerCustomElementsToWindow } from 'mml-web';

let iframeRemoteSceneWrapperPromise: Promise<IframeWrapperResult> | null = null;

export function getIframeTargetWindow(): Promise<IframeWrapperResult> | null {
  if (iframeRemoteSceneWrapperPromise !== null) {
    return iframeRemoteSceneWrapperPromise;
  }
  iframeRemoteSceneWrapperPromise = IframeWrapper.create().then((wrapper: any) => {
    registerCustomElementsToWindow(wrapper.iframeWindow);
    return wrapper;
  });
  return iframeRemoteSceneWrapperPromise;
}