// tokensSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tokens: [],
  loading: false,
};

const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    // Add a new token (payload must match the structure)
    addToken: (state, action) => {
      state.tokens.push({
        id: action.payload.id,
        imageURL: action.payload.imageURL,
        creatorMessage: action.payload.creatorMessage,
        socialMediaLinks: action.payload.socialMediaLinks || {}, // Default empty
        comments: [], // Initialize empty comments
        trades: [], // Initialize empty trades
        createdAt: Date.now(),
      });
    },
    // Add a comment to a specific token
    addComment: (state, action) => {
      const { tokenId, comment } = action.payload;
      const token = state.tokens.find((t) => t.id === tokenId);
      if (token) token.comments.push(comment);
    },
    addTrade: (state, action) => {
      const { tokenId, trade } = action.payload;
      const token = state.tokens.find((t) => t.id === tokenId);
      if (token) token.trades.push(trade);
    },
    // Update social links
    updateSocialLinks: (state, action) => {
      const { tokenId, links } = action.payload;
      const token = state.tokens.find((t) => t.id === tokenId);
      if (token) token.socialMediaLinks = { ...token.socialMediaLinks, ...links };
    },
  },
});

export const { addToken, addComment, addTrade, updateSocialLinks } = tokensSlice.actions;

export default tokensSlice.reducer;