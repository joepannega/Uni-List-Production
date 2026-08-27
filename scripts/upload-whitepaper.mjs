// One-off: upload a report/whitepaper PDF into a private Supabase Storage bucket.
//
// Run from the project root with your local env loaded, passing the SOURCE file
// and the destination OBJECT name explicitly (the object name matches the
// `OBJECT` constant in the report's download/route.ts):
//   node --env-file=.env.local scripts/upload-whitepaper.mjs "/path/to/file.pdf" after-the-offer.pdf

import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'

const BUCKET = 'lead-magnets'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const src = process.argv[2]
const OBJECT = process.argv[3]

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  console.error('Run with: node --env-file=.env.local scripts/upload-whitepaper.mjs <source.pdf> <object-name.pdf>')
  process.exit(1)
}

if (!src || !OBJECT) {
  console.error('Usage: node --env-file=.env.local scripts/upload-whitepaper.mjs <source.pdf> <object-name.pdf>')
  console.error('Both the source path and the destination object name are required (no defaults, to avoid overwriting the wrong file).')
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
