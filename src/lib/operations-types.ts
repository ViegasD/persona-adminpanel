export type Revision={id:number;item_id:number;status:string;voice:string;reuse_scene:boolean;phase:string|null;error:string|null;duration:number|null;model:string|null;created_at:string;updated_at:string;video_url:string|null;scene_url:string|null};
export type Engagement={item_id:number;viewed_at:string|null;completed_at:string|null;downloaded_at:string|null;ratings:{score:number;comment:string|null;rated_at:string}[]};
export type OrderOperations={processing_allowed:boolean;items:Engagement[];revisions:Revision[]};
export type ProviderAccount={provider:string;balance:string|null;source:string;unit:string;status:string;threshold:string;manual_balance:string|null;manual_at:string|null;checked_at:string|null;as_of:string|null;reason:string|null;error:string|null;last_success_at:string|null;last_alert_at:string|null};
export type Operations={revision:number;staff_email:string;alerts_enabled:boolean;providers:ProviderAccount[]};
