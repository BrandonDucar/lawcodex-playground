'use client';

import { useState } from 'react';
import { enhancedGovernanceService } from '@/services/governance.service.enhanced';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ExportFormat } from '@/types/governance';
import { toast } from 'sonner';

export function ConstitutionView(): JSX.Element {
  const [constitution, setConstitution] = useState<string>('');
  const [policies, setPolicies] = useState<string>('');
  const [governanceMap, setGovernanceMap] = useState<string>('');
  const [constitutionFormat, setConstitutionFormat] = useState<ExportFormat>('text');
  const [policiesFormat, setPoliciesFormat] = useState<ExportFormat>('text');

  const handleExportConstitution = (): void => {
    const doc = enhancedGovernanceService.exportConstitution(constitutionFormat);
    setConstitution(doc);
    toast.success(`Constitution generated in ${constitutionFormat} format`);
  };

  const handleExportPolicies = (): void => {
    const doc = enhancedGovernanceService.exportPolicies(policiesFormat);
    setPolicies(doc);
    toast.success(`Policies generated in ${policiesFormat} format`);
  };

  const handleGenerateMap = (): void => {
    const map = enhancedGovernanceService.generateGovernanceMap();
    setGovernanceMap(map);
    toast.success('Governance map generated');
  };

  const handleCopy = (text: string): void => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleDownload = (text: string, filename: string): void => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">DreamNet Constitutional Documents</h2>

      <Card>
        <CardHeader>
          <CardTitle>Generate Official Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Constitution Format</label>
                <Select value={constitutionFormat} onValueChange={(value) => setConstitutionFormat(value as ExportFormat)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="yaml">YAML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleExportConstitution}>
                Generate Constitution v1.0
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Policies Format</label>
                <Select value={policiesFormat} onValueChange={(value) => setPoliciesFormat(value as ExportFormat)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="yaml">YAML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleExportPolicies} variant="outline">
                Generate Policy Book
              </Button>
            </div>

            <Button onClick={handleGenerateMap} variant="outline">
              Generate Governance Map
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="constitution" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="constitution">Constitution</TabsTrigger>
          <TabsTrigger value="policies">Policy Book</TabsTrigger>
          <TabsTrigger value="map">Governance Map</TabsTrigger>
        </TabsList>

        <TabsContent value="constitution">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>DreamNet Constitution v1.0</CardTitle>
                {constitution && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopy(constitution)}
                    >
                      Copy All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownload(constitution, 'dreamnet-constitution-v1.txt')}
                    >
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {constitution ? (
                <ScrollArea className="h-[600px] w-full rounded border border-gray-700 p-4">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {constitution}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Click Generate Constitution v1.0 to create the foundational document
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Operational Policy Book</CardTitle>
                {policies && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopy(policies)}
                    >
                      Copy All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownload(policies, 'dreamnet-policies.txt')}
                    >
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {policies ? (
                <ScrollArea className="h-[600px] w-full rounded border border-gray-700 p-4">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {policies}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Click Generate Policy Book to create the operational policy document
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Complete Governance Map</CardTitle>
                {governanceMap && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopy(governanceMap)}
                    >
                      Copy All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownload(governanceMap, 'dreamnet-governance-map.txt')}
                    >
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {governanceMap ? (
                <ScrollArea className="h-[600px] w-full rounded border border-gray-700 p-4">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {governanceMap}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Click Generate Governance Map to create the complete codex overview
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
