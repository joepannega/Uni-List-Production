// One-off: upload the whitepaper PDF into a private Supabase Storage bucket.
//
// Run from the project root with your local env loaded:
//   node --env-file=.env.local scripts/upload-whitepaper.mjs
//
// Optionally pass a source path (defaults to the file in ~/Downloads):
//   node --env-file=.env.local scripts/upload-whitepaper.mjs "/path/to/file.pdf"

import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

const BUCKET = 'lead-magnets'
const OBJECT = 'after-the-offer.pdf'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const src =
  process.argv[2] || join(homedir(), 'Downloads', 'Whitepaper - After the offer.pdf')

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  console.error('Run with: node --env-file=.env.local scripts/upload-whitepaper.mjs')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

// Create the bucket if it doesn't exist (private).
const { error: bucketError } = await supabase.storage.createBucket(BUCKET, {
  public: false,
})
if (bucketError && !/already exists/i.test(bucketError.message)) {
  console.error('Could not create bucket:', bucketError.message)
  process.exit(1)
}

const file = await readFile(src)
const { error: uploadError } = await supabase.storage
  .from(BUCKET)
  .upload(OBJECT, file, { contentType: 'application/pdf', upsert: true })

if (uploadError) {
  console.error('Upload failed:', uploadError.message)
  process.exit(1)
}

console.log(`✓ Uploaded ${OBJECT} (${(file.length / 1024).toFixed(0)} KB) to bucket "${BUCKET}".`)
