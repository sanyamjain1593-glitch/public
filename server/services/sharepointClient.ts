import { Client } from '@microsoft/microsoft-graph-client';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sharepoint',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('SharePoint not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableSharePointClient() {
  const accessToken = await getAccessToken();

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => accessToken
    }
  });
}

export class SharePointService {
  private listId = 'FutureBoardTasks'; // SharePoint list for storing tasks

  async syncTaskToSharePoint(task: any) {
    try {
      const client = await getUncachableSharePointClient();
      
      const sharePointTask = {
        Title: task.title,
        Description: task.description,
        Status: task.status,
        Priority: task.priority,
        DueDate: task.dueDate,
        CompletedAt: task.completedAt,
        Progress: task.progress,
        AssigneeInitials: task.assigneeInitials,
        Category: task.category,
        LocalTaskId: task.id,
      };

      if (task.sharepointId) {
        // Update existing item
        await client.api(`/sites/root/lists/${this.listId}/items/${task.sharepointId}`).patch(sharePointTask);
      } else {
        // Create new item
        const response = await client.api(`/sites/root/lists/${this.listId}/items`).post(sharePointTask);
        return response.id;
      }
    } catch (error) {
      console.error('Error syncing task to SharePoint:', error);
      throw error;
    }
  }

  async syncTasksFromSharePoint() {
    try {
      const client = await getUncachableSharePointClient();
      
      const response = await client.api(`/sites/root/lists/${this.listId}/items`)
        .expand('fields')
        .get();

      return response.value.map((item: any) => ({
        sharepointId: item.id,
        title: item.fields.Title,
        description: item.fields.Description,
        status: item.fields.Status,
        priority: item.fields.Priority,
        dueDate: item.fields.DueDate ? new Date(item.fields.DueDate) : null,
        completedAt: item.fields.CompletedAt ? new Date(item.fields.CompletedAt) : null,
        progress: item.fields.Progress || 0,
        assigneeInitials: item.fields.AssigneeInitials,
        category: item.fields.Category,
        localTaskId: item.fields.LocalTaskId,
        lastSynced: new Date(),
      }));
    } catch (error) {
      console.error('Error syncing tasks from SharePoint:', error);
      throw error;
    }
  }

  async deleteTaskFromSharePoint(sharepointId: string) {
    try {
      const client = await getUncachableSharePointClient();
      await client.api(`/sites/root/lists/${this.listId}/items/${sharepointId}`).delete();
    } catch (error) {
      console.error('Error deleting task from SharePoint:', error);
      throw error;
    }
  }
}

export const sharePointService = new SharePointService();
