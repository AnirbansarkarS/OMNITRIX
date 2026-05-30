import { Client } from '@gradio/client';
async function test() {
    try {
        const hfToken = process.env.HF_TOKEN || 'your-token-here';
        const client = await Client.connect('TencentARC/InstantMesh', { hf_token: hfToken });
        console.log(JSON.stringify(await client.view_api(), null, 2));
    } catch(e) {
        console.error(e);
    }
}
test();
