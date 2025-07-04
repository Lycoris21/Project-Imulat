import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const getActivityIcon = (type) => {
  switch (type) {
    case 'LIKE':
      return '👍';
    case 'DISLIKE':
      return '👎';
    case 'COMMENT':
    case 'REPLY':
      return '💬';
    case 'REPORT_CREATE':
      return '📋';
    case 'CLAIM_CREATE':
      return '✍️';
    case 'BOOKMARK_CREATE':
      return '🔖';
    case 'PROFILE_UPDATE':
      return '👤';
    case 'REPORT_DELETE':
    case 'CLAIM_DELETE':
    case 'BOOKMARK_DELETE':
    case 'COMMENT_DELETE':
      return '🗑️';
    case 'REPORT_UPDATE':
    case 'CLAIM_UPDATE':
    case 'BOOKMARK_UPDATE':
    case 'COMMENT_UPDATE':
    case 'COMMENT_EDIT':
      return '✏️';
    default:
      return '🔔';
  }
};

const getActivityText = (activity) => {
  const { type, targetType, target, actionDetails } = activity;

  // Get owner information from populated target
  const targetOwner =
    target?.owner?.username ||
    target?.user?.username ||
    target?.userId?.username ||
    target?.username;


  switch (type) {
    case 'LIKE':
      if (targetType === 'REPORT') return targetOwner ? `liked ${targetOwner}'s report` : 'liked a report';
      if (targetType === 'CLAIM') return targetOwner ? `liked ${targetOwner}'s claim` : 'liked a claim';
      if (targetType === 'COMMENT') return targetOwner ? `liked ${targetOwner}'s comment` : 'liked a comment';
      if (targetType === 'USER') return targetOwner ? `liked ${targetOwner}` : 'liked a user';
      return `liked a ${targetType.toLowerCase()}`;
    case 'DISLIKE':
      if (targetType === 'REPORT') return targetOwner ? `disliked ${targetOwner}'s report` : 'disliked a report';
      if (targetType === 'CLAIM') return targetOwner ? `disliked ${targetOwner}'s claim` : 'disliked a claim';
      if (targetType === 'COMMENT') return targetOwner ? `disliked ${targetOwner}'s comment` : 'disliked a comment';
      if (targetType === 'USER') return targetOwner ? `disliked ${targetOwner}'s profile` : 'disliked a user';
      return `disliked a ${targetType.toLowerCase()}`;
    case 'COMMENT':
      if (targetType === 'REPORT') return targetOwner ? `commented on ${targetOwner}'s report` : 'commented on a report';
      if (targetType === 'CLAIM') return targetOwner ? `commented on ${targetOwner}'s claim` : 'commented on a claim';
      return 'commented on';
    case 'REPLY':
      if (targetOwner) return `replied to ${targetOwner}'s comment`;
      return 'replied to a comment';
    case 'REPORT_CREATE':
      return 'created a report';
    case 'CLAIM_CREATE':
      return 'made a claim';
    case 'BOOKMARK_CREATE':
      // For bookmarks, get the bookmarked item details
      const bookmarkedItem = target?.targetId;
      const bookmarkedOwner = bookmarkedItem?.user?.username || bookmarkedItem?.userId?.username;
      const bookmarkedType = target?.targetType?.toLowerCase() || 'item';
      if (bookmarkedOwner && bookmarkedItem) {
        return `bookmarked ${bookmarkedOwner}'s ${bookmarkedType}`;
      }
      return 'bookmarked an item';
    case 'PROFILE_UPDATE':
      if (actionDetails === 'password') return 'changed your password';
      if (actionDetails === 'delete') return 'deleted your account';
      if (actionDetails === 'info') return 'updated your profile information';
      return 'updated their profile';
    case 'REPORT_DELETE':
      return 'deleted a report';
    case 'CLAIM_DELETE':
      return 'deleted a claim';
    case 'BOOKMARK_DELETE':
      return 'removed a bookmark';
    case 'COMMENT_DELETE':
      return 'deleted a comment';
    case 'CLAIM_UPDATE':
      return targetOwner ? `updated ${targetOwner}'s claim` : 'updated a claim';
    case 'COMMENT_UPDATE':
    case 'COMMENT_EDIT':
      return targetOwner ? `edited your comment on ${targetOwner}'s ${target.targetType.toLowerCase()}` : 'edited your comment';
    default:
      return 'performed an action';
  }
};

const getActivityLink = (activity) => {
  const { type, targetType, target } = activity;

  // Profile updates are not clickable
  if (type === 'PROFILE_UPDATE') {
    return "#";
  }

  // Helper function to extract ID from target
  const getTargetId = (target) => {
    if (typeof target === 'string') return target;
    if (target?._id) return target._id;
    if (target?.id) return target.id;
    return null;
  };

  switch (targetType) {
    case 'REPORT':
      const reportId = getTargetId(target);
      if (!reportId) return '#';
      // For comments/replies on reports, scroll to comment section
      if (type === 'COMMENT' || type === 'REPLY') {
        return `/reports/${reportId}#comments`;
      }
      return `/reports/${reportId}`;
    case 'CLAIM':
      const claimId = getTargetId(target);
      if (!claimId) return '#';
      // For comments/replies on claims, scroll to comment section
      if (type === 'COMMENT' || type === 'REPLY') {
        return `/claims/${claimId}#comments`;
      }
      return `/claims/${claimId}`;
    case 'COMMENT':
      const commentId = getTargetId(target);
      const parentId = getTargetId(target?.parent);
      if (!commentId || !parentId) return '#';
      // For comment reactions, find the parent and scroll to that comment
      if (target.parentType === 'Report') {
        return `/reports/${parentId}#comment-${commentId}`;
      } else if (target.parentType === 'Claim') {
        return `/claims/${parentId}#comment-${commentId}`;
      }
      return `/reports/${parentId}#comments`;
    case 'USER':
      const userId = getTargetId(target);
      if (!userId) return '#';
      return `/profile/${userId}`;
    case 'BOOKMARK':
      // For bookmarks, navigate to the bookmarked item (report/claim)
      if (target?.targetId) {
        const bookmarkedId = getTargetId(target.targetId);
        if (!bookmarkedId) return '#';
        const bookmarkedType = target.targetType?.toLowerCase();
        if (bookmarkedType === 'report') {
          return `/reports/${bookmarkedId}`;
        } else if (bookmarkedType === 'claim') {
          return `/claims/${bookmarkedId}`;
        }
      }
      const bookmarkId = getTargetId(target);
      return bookmarkId ? `/bookmarks/${bookmarkId}` : '#';
    default:
      return '#';
  }
};

const getTargetTitle = (activity) => {
  const { target, targetType, type } = activity;

  if (!target) return null;

  // Handle different target structures from populated data
  if (typeof target === 'string') return null; // Just an ID

  // For bookmarks, get the title of the bookmarked item
  if (type === 'BOOKMARK_CREATE' && target.targetId) {
    return target.targetId.reportTitle || target.targetId.claimTitle;
  }

  // Standard title fields
  if (target.title) return target.title;
  if (target.reportTitle) return target.reportTitle;
  if (target.claimTitle) return target.claimTitle;

  // For comments, show content preview
  if (target.commentContent && target.commentContent.length > 0) {
    return target.commentContent.substring(0, 50) + (target.commentContent.length > 50 ? '...' : '');
  }

  // For users
  if (target.username) return target.username;
  if (target.name) return target.name;

  return null;
};

const getTargetTypeLabel = (activity) => {
  const { targetType, type } = activity;

  switch (targetType) {
    case 'REPORT': return 'report';
    case 'CLAIM': return 'claim';
    case 'COMMENT': return 'comment';
    case 'USER': return 'user';
    case 'BOOKMARK': return 'bookmark';
    default: return targetType.toLowerCase();
  }
};

const ActivityItem = ({ activity }) => {
  // Debug logging
  console.log('ActivityItem received:', activity);
  console.log('Target data:', activity.target);

  const icon = getActivityIcon(activity.type);
  const text = getActivityText(activity);
  const link = getActivityLink(activity);
  const time = format(new Date(activity.createdAt), 'h:mm a');
  const targetTitle = getTargetTitle(activity);
  const targetTypeLabel = getTargetTypeLabel(activity);

  // Debug the link generation
  console.log('Generated link:', link);

  // If no link (like profile updates), render as non-clickable div
  if (!link) {
    return (
      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-lg">
            {icon}
          </div>
        </div>
        <div className="flex-grow min-w-0">
          <div className="text-sm">
            <span className="text-gray-900">You </span>
            <span className="font-medium text-gray-700">{text}</span>
            {targetTitle && (
              <span className="ml-1">
                <span className="text-gray-500"> "</span>
                <span className="text-gray-700 font-medium">{targetTitle}</span>
                <span className="text-gray-500">"</span>
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center space-x-2">
            <p className="text-xs text-gray-500">{time}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render as clickable card
  return (
    <Link
      to={link}
      className="flex items-start space-x-4 p-4 hover:bg-gray-50 transition-colors duration-200 rounded-lg cursor-pointer group"
    >
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[color:var(--color-base)] text-lg">
          {icon}
        </div>
      </div>
      <div className="flex-grow min-w-0">
        <div className="text-sm">
          <span className="text-gray-900">You </span>
          <span className="font-medium text-[color:var(--color-base)] group-hover:text-[color:var(--color-dark)] transition-colors">
            {text}
          </span>
           {targetTitle && activity.targetType !== 'USER' && (
            <span className="ml-1">
              <span className="text-gray-500">
                {(() => {
                  if (activity.targetType === 'USER' || activity.type === 'PROFILE_UPDATE') return 'of "';
                  if ((activity.targetType === 'COMMENT' && activity.type !== 'COMMENT_EDIT') && activity.type !== 'REPLY') return 'on "';
                  return 'titled "';
                })()}
              </span>
              <span className="text-gray-700 font-medium">{targetTitle}</span>
              <span className="text-gray-500">"</span>
            </span>
          )}
          {!targetTitle && targetTypeLabel &&
            activity.type !== 'PROFILE_UPDATE' &&
            !activity.type.includes('DELETE') && (
              <span className="ml-1 text-gray-500">
                on this {targetTypeLabel}
              </span>
            )}
        </div>
        <div className="mt-1 flex items-center space-x-2">
          <p className="text-xs text-gray-500">{time}</p>
          {(activity.type === 'COMMENT' || activity.type === 'REPLY') && (
            <span className="text-xs text-[color:var(--color-base)]">• Click to view comment</span>
          )}
          {(activity.type === 'LIKE' || activity.type === 'DISLIKE') && activity.targetType === 'COMMENT' && (
            <span className="text-xs text-[color:var(--color-base)]">• Click to view comment</span>
          )}
          {activity.type === 'BOOKMARK_CREATE' && (
            <span className="text-xs text-[color:var(--color-base)]">• Click to view bookmarked item</span>
          )}
        </div>
      </div>
    </Link>

  );
};

const ActivityFeed = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start space-x-4 p-4">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full" />
            <div className="flex-grow">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="mt-2 h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No activities to show
      </div>
    );
  }

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = format(new Date(activity.createdAt), 'MMMM d, yyyy');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  return (
    <div className="divide-y divide-gray-200">
      {Object.entries(groupedActivities).map(([date, dateActivities]) => (
        <div key={date} className="space-y-2">
          <h3 className="px-4 py-3 text-lg font-semibold text-gray-800 bg-gray-50 border-b border-gray-200">
            {date}
          </h3>
          <div className="divide-y divide-gray-100">
            {dateActivities.map((activity) => (
              <ActivityItem key={activity._id} activity={activity} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
