import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Image, Video, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function FileUploader() {
  const [files, setFiles] = useState<Array<{ path: string; url: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setError(null);

    try {
      // Validate Supabase connection
      if (!supabase || !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Please configure your Supabase credentials first');
      }

      // Check if storage is accessible and bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Buckets error:', bucketsError);
        throw new Error(`Storage access error: ${bucketsError.message}`);
      }

      const filesBucket = buckets?.find(b => b.name === 'files');
      if (!filesBucket) {
        throw new Error('Storage bucket "files" not found. Please create it in your Supabase dashboard.');
      }

      const uploadPromises = acceptedFiles.map(async (file) => {
        try {
          // Validate file size
          if (file.size > 100 * 1024 * 1024) {
            throw new Error(`File ${file.name} exceeds maximum size of 100MB`);
          }

          const fileExt = file.name.split('.').pop()?.toLowerCase();
          if (!fileExt) {
            throw new Error(`Invalid file extension for ${file.name}`);
          }

          // Create a unique filename with timestamp and random string
          const timestamp = new Date().getTime();
          const randomString = Math.random().toString(36).substring(2, 15);
          const fileName = `${timestamp}-${randomString}.${fileExt}`;

          // Upload the file
          const { error: uploadError, data } = await supabase.storage
            .from('files')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error(`Error uploading ${file.name}: ${uploadError.message}`);
          }

          if (!data) {
            throw new Error(`Failed to upload ${file.name}: No data returned`);
          }

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('files')
            .getPublicUrl(fileName);

          return {
            path: fileName,
            url: publicUrl
          };
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          throw error;
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      
      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<{ path: string; url: string }> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);

      const failedUploads = results
        .filter((result): result is PromiseRejectedResult => 
          result.status === 'rejected'
        );

      if (failedUploads.length > 0) {
        const errorMessages = failedUploads
          .map(result => result.reason.message)
          .join('\n');
        throw new Error(`Failed to upload some files:\n${errorMessages}`);
      }

      setFiles(prev => [...prev, ...successfulUploads]);
    } catch (error) {
      console.error('Upload process error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred during upload');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({ 
    onDrop,
    maxSize: 100 * 1024 * 1024, // 100MB max file size
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov']
    }
  });

  const getFileIcon = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <Image className="w-6 h-6" />;
    if (['mp4', 'webm', 'mov'].includes(ext || '')) return <Video className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-300' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className={`w-12 h-12 mx-auto mb-4 ${error ? 'text-red-400' : 'text-gray-400'}`} />
        <p className="text-lg text-gray-600">
          {isDragActive
            ? "Drop the files here..."
            : "Drag 'n' drop images or videos here, or click to select files"}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supported formats: JPG, PNG, GIF, WEBP, MP4, WEBM, MOV (Max 100MB)
        </p>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm whitespace-pre-wrap">{error}</div>
        </div>
      )}

      {fileRejections.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="font-medium">Invalid files:</span>
          </div>
          <ul className="list-disc list-inside text-sm">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name}: {errors.map(e => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {uploading && (
        <div className="mt-4 text-center">
          <Loader2 className="w-6 h-6 animate-spin inline-block" />
          <span className="ml-2">Uploading...</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.url)}
                  <span className="text-gray-700">{file.path}</span>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Direct Link</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}