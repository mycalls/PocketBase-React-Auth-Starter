import PocketBase from 'pocketbase';

const baseUrl = import.meta.env.PROD ? '/' : 'http://127.0.0.1:8090/';

const pb = new PocketBase(baseUrl);

// disable autocancellation so that we can handle async requests from multiple users
pb.autoCancellation(false);

export default pb;
