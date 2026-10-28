import assert from 'node:assert/strict';
import test from 'node:test';
import { assetUrl } from '../src/utils/assetUrl.ts';

test('resolves scenario media remotely and keeps other Pages assets local', () => {
  process.env.NEXT_PUBLIC_BASE_PATH = '/ft-google-cloud-game-2';
  process.env.NEXT_PUBLIC_SCENARIO_ASSET_BASE_URL = 'https://storage.googleapis.com/ft-cloud-game-2';
  delete process.env.NEXT_PUBLIC_ASSET_BASE_URL;
  const scenario = '/assets/video/scene_videos/character_0_scenarios/scenario_0/intro.mp4';
  const expected = `https://storage.googleapis.com/ft-cloud-game-2${scenario}`;
  assert.equal(assetUrl(scenario), expected);
  assert.equal(assetUrl(scenario.slice(1)), expected);
  assert.equal(assetUrl(`/ft-google-cloud-game-2${scenario}`), expected);
  assert.equal(assetUrl(expected), expected);
  assert.equal(assetUrl('/assets/images/logo.svg'), '/ft-google-cloud-game-2/assets/images/logo.svg');
  assert.equal(assetUrl('/ft-google-cloud-game-2/assets/images/logo.svg'), '/ft-google-cloud-game-2/assets/images/logo.svg');
  assert.equal(assetUrl('blob:preview'), 'blob:preview');
  delete process.env.NEXT_PUBLIC_SCENARIO_ASSET_BASE_URL;
  assert.equal(assetUrl(scenario), `/ft-google-cloud-game-2${scenario}`);
});
