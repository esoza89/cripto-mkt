'use client';
import { useDispatch } from 'react-redux';
import { initializeTokens } from '../store/tokensSlice';
import { useEffect, useState } from "react"


const historicalTokens = [
  {
    id: 0,
    imageURL: 'https://orange-important-rook-311.mypinata.cloud/ipfs/bafybeife7qr3hkrky3hcsxjj6fp4lbbhzvg6vachvvkgkbaw6smbofi2oa',
    creatorMessage: 'Primer Token!',
    socialMediaLinks: {},
    comments: [],
    createdAt: Date.now() - 518400000
  },
  {
    id: 1,
    imageURL: 'https://orange-important-rook-311.mypinata.cloud/ipfs/bafybeibvt2humj2otyrhpqdx3e2xvupmuxfpalx63tjcorlkv7yzpmttye',
    creatorMessage: 'Shrek es amor!',
    socialMediaLinks: {},
    comments: [],
    createdAt: Date.now() - 345600000
  },
  {
    id: 2,
    imageURL: 'https://orange-important-rook-311.mypinata.cloud/ipfs/bafybeiabi6ckk3k7wvnov6osidqm3xwij4txl4p6bc5eij4efafev3qie4',
    creatorMessage: 'Pepe es la pildora roja!',
    socialMediaLinks: {},
    comments: [],
    createdAt: Date.now() - 259200000
  },
  {
    id: 3,
    imageURL: 'https://orange-important-rook-311.mypinata.cloud/ipfs/bafybeif4uu3xxjespf36kb2pev2pex6wvwtadyps2fkg37du5tywbgzh64',
    creatorMessage: 'Todo esta bien',
    socialMediaLinks: {},
    comments: [],
    createdAt: Date.now() - 172800000
  },
  {
    id: 4,
    imageURL: 'https://orange-important-rook-311.mypinata.cloud/ipfs/bafkreidptsnl5muxysd4pgvzt7vgirqk5k7o2dxehqpjw7jqj6n6xe5m4y',
    creatorMessage: 'guapo, poderoso, asombroso!',
    socialMediaLinks: {},
    comments: [],
    createdAt: Date.now() - 172000000
  },
  {
    id: 5,
    imageURL: 'https://orange-important-rook-311.mypinata.cloud/ipfs/bafkreia5vtervzyaw2vem4iv34xyuspr3svde2ydetg7e6sduxoxjc4voe',
    creatorMessage: 'Que!',
    socialMediaLinks: {},
    comments: [],
    createdAt: Date.now() - 86400000
  },
  {
    id: 6,
    imageURL: 'https://orange-important-rook-311.mypinata.cloud/ipfs/bafkreibz4ccnor2lft26hjfgyvmzskpnzlgk7gjdeja6shvvizywtsmmqm',
    creatorMessage: 'Y esperate a lo que viene',
    socialMediaLinks: {},
    comments: [],
    createdAt: Date.now()
  },
];

export default function LoadHistoricalTokens() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeTokens(historicalTokens));
    console.log('Historical tokens injected!');
  }, []);

  return null; // This component doesn't render anything
}