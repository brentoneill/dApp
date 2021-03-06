import { expect } from 'chai';
import Web3 from 'web3';
import FakeProvider from 'web3-fake-provider';

import { getMetamaskError, signMessage, calculateCollateral } from '../../src/util/utils';

describe('getMetamaskError', () => {

  it('should return "User denied transaction" for declined MetaMask transactions', async () => {
    const expectedErrorMessage = 'User denied transaction';

    const actualErrorMessage =
      getMetamaskError('Error: MetaMask Tx Signature: User denied transaction signature.');

    expect(actualErrorMessage).to.equals(expectedErrorMessage);
  });

  it('should return original error message as a fallback', async () => {
    const expectedErrorMessage = 'Error: MetaMask Tx Signature: User denied signature.';

    const actualErrorMessage =
      getMetamaskError('Error: MetaMask Tx Signature: User denied signature.');

    expect(actualErrorMessage).to.equals(expectedErrorMessage);
  });
});

describe('signMessage', () => {
  function getStubedWeb3(rawSignature) {
    const fakeProvider = new FakeProvider();
    const web3 = new Web3(fakeProvider);
    fakeProvider.injectResult(rawSignature);
    return web3;
  }

  it('should correctly extract [v, r, s] from signature', () => {
    const rawSignature = '0x9955af11969a2d2a7f860cb00e6a00cfa7c581f5df2dbe8ea16700b33f4b4b9b69f945012f7ea7d3febf11eb1b78e1adc2d1c14c2cf48b25000938cc1860c83e01';
    const web3 = getStubedWeb3(rawSignature);
    const v = 28;
    const r = '0x9955af11969a2d2a7f860cb00e6a00cfa7c581f5df2dbe8ea16700b33f4b4b9b';
    const s = '0x69f945012f7ea7d3febf11eb1b78e1adc2d1c14c2cf48b25000938cc1860c83e';

    const [ actualV, actualR, actualS] = signMessage(web3, '0xf204a4ef082f5c04bb89f7d5e6568b796096735a', 'This is my message :)');
    
    expect(v, 'v not extracted correctly').to.equal(actualV);
    expect(r, 'r not extracted correctly').to.equal(actualR);
    expect(s, 's not extracted correctly').to.equal(actualS);
  });
});

describe('calculateCollateral', () => {
  [
/* [priceFloor, priceCap, qtyMultiplier, qty,   price,    expectedCollateral] */
    [20,          50,       2,            3,      10,        0],
    [20,          50,       2,            3,      25,        30],
    [20,          50,       2,            -3,     60,        0],
    [20,          50,       2,            -3,     25,        150]
  ].forEach((testCase) => {
    it(`expects calculateCollateral(${testCase.slice(0, 5)}) to equal ${testCase[5]}`, () => {
      const actualCollateral = calculateCollateral(...testCase);
      const expectedCollateral = testCase[5];

      expect(expectedCollateral).to.equal(actualCollateral);
    });
  });
});
