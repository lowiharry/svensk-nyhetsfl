-- Add DELETE policy for article_interactions so users can change their reactions
CREATE POLICY "Everyone can delete interactions" 
ON article_interactions 
FOR DELETE 
USING (true);

-- Also add UPDATE policy in case we need it later
CREATE POLICY "Everyone can update interactions" 
ON article_interactions 
FOR UPDATE 
USING (true);